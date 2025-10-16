# Remote Response Types

This directory contains standardized types for responses from Svelte remote functions, ensuring consistency across all remote function implementations.

## RemoteResponse<T>

The standard response type for all remote functions:

```typescript
interface RemoteResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T | null;
}
```

## Usage

### Creating a Successful Response

```typescript
import { createSuccessResponse } from '$lib/types';

export const myQuery = query(async () => {
    const data = await fetchData();
    return createSuccessResponse('Data fetched successfully', data);
});
```

### Creating an Error Response

```typescript
import { createErrorResponse } from '$lib/types';

export const myCommand = command(async (id) => {
    try {
        await processData(id);
        return createSuccessResponse('Processing completed', { id });
    } catch (error) {
        return createErrorResponse(`Processing failed: ${error.message}`);
    }
});
```

### Creating a Batch Response

For operations that process multiple items:

```typescript
import { createBatchResponse } from '$lib/types';

export const batchProcess = command(async (items) => {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const item of items) {
        try {
            await processItem(item);
            successCount++;
        } catch (error) {
            errorCount++;
            errors.push(`Item ${item.id}: ${error.message}`);
        }
    }
    
    return createBatchResponse(
        successCount > 0,
        `Processed ${items.length} items`,
        { successCount, errorCount },
        successCount,
        errorCount,
        errors
    );
});
```

## Best Practices

1. **Always use the helper functions** to create responses instead of constructing them manually
2. **Provide descriptive messages** that explain what happened
3. **Include relevant data** in successful responses
4. **Use batch responses** for operations that process multiple items
5. **Be consistent** with response formats across all remote functions

## Type Safety

The generic type parameter `T` ensures type safety for the data property:

```typescript
// TypeScript will infer the correct type
const response = createSuccessResponse('User created', {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com'
});

// response.data is typed as { id: number; name: string; email: string; } | null