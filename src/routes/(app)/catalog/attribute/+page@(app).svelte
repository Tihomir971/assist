<script lang="ts">
	import type { SupabaseTable } from '$lib/types/database.types';
	import Trash from 'phosphor-svelte/lib/Trash';
	import type { PageData } from './$types';
	import NotePencil from 'phosphor-svelte/lib/NotePencil';

	type AttributeValue = SupabaseTable<'m_attributevalue'>['Row'] & { ad_org: { name: string } };
	//type AttributeValue = SupabaseTable<'m_attributevalue'> & Pick<SupabaseTable<'ad_org'>, 'name'>;
	type Attribute = SupabaseTable<'m_attribute'>['Row'] &
		Pick<SupabaseTable<'ad_org'>['Row'], 'name'>;
	export let data: PageData;
	$: ({ attributes, supabase } = data);

	let attributeValues: AttributeValue[];
	let selectedAttribute: Attribute;
	let selectedAttributeValue: AttributeValue;

	async function clickAttribute(row: Attribute) {
		if (selectedAttribute?.id === row.id) return;
		selectedAttribute = row;
		if (row.attributevaluetype === 'Select') {
			const { data } = await supabase
				.from('m_attributevalue')
				.select('*,ad_org(name)')
				.eq('m_attribute_id', row.id)
				.order('name');
			if (data) {
				//let distinctValues = data
				//	.map((item) => item.ad_org_id) // get all values of ad_org_id
				//	.filter((value, index, self) => self.indexOf(value) === index); // filter out duplicates
				attributeValues = data;
			}
		} else {
			attributeValues = [];
		}
		return;
	}

	async function clickAttributeValue(row: SupabaseTable<'m_attributevalue'>['Row']) {
		return;
	}
</script>

<div class="container m-auto">
	<div class="flex">
		<div class="overflow-x-auto">
			<div class="flex items-center justify-between p-4">
				<h3 class="text-2xl">Attributes</h3>
				<div>
					<button class="btn btn-secondary">Add</button>
				</div>
			</div>
			{#if attributes}
				<table class="table">
					<!-- head -->
					<thead>
						<tr>
							<th>Organisation</th>
							<th>Name</th>
							<th>Description</th>
							<th>Active</th>
							<th>Attribute Value Type</th>
							<th>Mandatory</th>
							<th>Instance Attribute</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<!-- row 1 -->
						{#each attributes as attribute}
							<tr
								class:bg-base-300={selectedAttribute?.id === attribute.id}
								class="hover"
								on:click={() => clickAttribute(attribute)}
							>
								<th>{attribute.ad_org?.name}</th>
								<th>{attribute.name}</th>
								<th>{attribute.description}</th>
								<th class="text-center"
									><input
										type="checkbox"
										class="checkbox checkbox-sm"
										checked={attribute.isactive}
										disabled
									/></th
								>
								<th>{attribute.attributevaluetype}</th>
								<th class="text-center"
									><input
										type="checkbox"
										class="checkbox checkbox-sm"
										checked={attribute.ismandatory}
										disabled
									/></th
								>
								<th class="text-center"
									><input
										type="checkbox"
										class="checkbox checkbox-sm"
										checked={attribute.isinstanceattribute}
										disabled
									/></th
								>
								<th class="flex text-center">
									<div class="drawer drawer-end">
										<input id="my-drawer-4" type="checkbox" class="drawer-toggle" />
										<div class="drawer-content">
											<!-- Page content here -->
											<label for="my-drawer-4" class="btn btn-square btn-ghost drawer-button btn-sm"
												><NotePencil size={20} weight="bold" />
											</label>
										</div>
										<div class="drawer-side overflow-x-hidden">
											<label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"
											></label>
											<ul class="menu bg-base-200 text-base-content min-h-full w-80 p-4">
												<!-- Sidebar content here -->
												<li><a href="/">Sidebar Item 1</a></li>
												<li><a href="/">Sidebar Item 2</a></li>
											</ul>
										</div>
									</div>
								</th>
								<th
									><button class="btn btn-square btn-ghost btn-sm">
										<Trash size={32} />
									</button>
								</th>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
		<div class="divider divider-horizontal"></div>
		<div class="overflow-x-auto">
			{#if attributeValues}
				<div class="flex items-center justify-between p-4">
					<h3 class="text-2xl">Attributes Values</h3>
					<div>
						<button class="btn btn-secondary">Add</button>
					</div>
				</div>
				<table class="table">
					<!-- head -->
					<thead>
						<tr>
							<th>Organisation</th>
							<th>Attribute</th>
							<th>Description</th>
							<th>Active</th>
						</tr>
					</thead>
					<tbody>
						<!-- row 1 -->
						{#each attributeValues as attributeValue}
							<tr
								class:bg-base-300={selectedAttributeValue?.id === attributeValue.id}
								class="hover"
								on:click={() => clickAttributeValue(attributeValue)}
							>
								<th>{attributeValue.ad_org?.name}</th>
								<th>{attributeValue.name}</th>
								<th>{attributeValue.description}</th>
								<th
									><input
										type="checkbox"
										class="checkbox checkbox-sm"
										checked={attributeValue.isactive}
										disabled
									/></th
								>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>
</div>
