# RooCode: Channel Mapping Synchronization Architecture

## 1. Core Concept

The external Hono.js application is the **synchronization engine**. Its primary responsibility is to actively manage and execute the synchronization of data between our application and all connected external channels (like an ERP). It is not merely a passive webhook receiver.

The `c_channel_map_*` tables are the central directory that enables this engine to function.

## 2. Synchronization Process

The Hono.js engine will perform synchronization tasks. For example, a "Sync Products" task would execute the following logic:

1.  **Fetch All Mapped Products**: The engine queries the `c_channel_map_product` table to get a complete list of all products that are linked to a specific external channel (e.g., the ERP).

    ```sql
    -- Get all products that should be synced with the ERP
    SELECT
      p.id AS internal_id,
      p.updated_at AS internal_last_updated,
      cmap.external_product_id,
      cmap.updated_at AS mapping_last_updated
    FROM m_product p
    JOIN c_channel_map_product cmap ON p.id = cmap.m_product_id
    JOIN c_channel chan ON cmap.c_channel_id = chan.id
    WHERE chan.name = 'ERP';
    ```

2.  **Fetch External Data**: For each mapped product, the engine makes an API call to the ERP to get the current state of that product, using the `external_product_id`.

3.  **Compare and Update**: The engine compares the data from our database with the data from the ERP. It uses the `updated_at` timestamps from both the product table and the ERP's response to determine the source of truth.

    -   If our internal product is newer, it **pushes** an update to the ERP.
    -   If the ERP's product data is newer, it **pulls** the update from the ERP and updates our internal product record.

4.  **Create New Mappings**: If the engine discovers a new product in the ERP that doesn't exist in our mapping table, it can be configured to automatically create the new product in our system and add a new entry to the `c_channel_map_product` table to link them for future syncs.

## 3. Role of the SvelteKit UI

The SvelteKit application's role is to provide a user-friendly interface for **managing these mappings**. The "Channel Mapping" tabs allow users to manually:
-   **Create** new links between an internal entity and an external one.
-   **Review** existing links.
-   **Delete** links if an entity should no longer be synchronized with a specific channel.

This manual management is crucial for bootstrapping the system and handling exceptions, but the active, ongoing synchronization is the responsibility of the Hono.js engine.