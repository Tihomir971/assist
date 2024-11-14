
	/* 	const formPPO = superForm(data.formProductPO, {
		validators: zodClient(crudmProductPoSchema),
		onUpdated({ form }) {
			console.log('Form updated', form); 
			if (form.valid) {
				toast.success('Product added successfully', {
					description: form.message
				});
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to add product', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formProductPO, enhance: enhanceProductPO } = formPPO; */

	/* 	const formReplenish = superForm(data.formReplenish, {
		dataType: 'json',
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Replenish data updated successfully', {
					description: form.message
				});
				// Invalidate the page to refresh all data
				invalidate('catalog:product');
			} else {
				console.error('Form is not valid', form.errors, form.message);
				toast.error('Failed to update replenish data', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formReplenishUpd, enhance: enhanceReplenishUpd } = formReplenish; */
	//	const { form: formReplenishMod, enhance: enhanceReplenishMod } = formReplenish;
    			<!-- <VendorsTab data={data.formProductPO} vendors={data.productPurchasing} /> -->
			<!-- <Card.Root>
					<Card.Header>
						<Card.Title>Vendor Information</Card.Title>
					</Card.Header>
					<Card.Content>
						<form method="post" action="?/mProductPo" use:enhanceProductPO>
							<div class="overflow-x-auto">
								<Table.Root>
									<Table.Body> -->
			<!-- {#each data.m_product_po as productPurchase}
											<Table.Row>
												<Table.Cell>{formatDateTime(productPurchase.updated)}</Table.Cell>
												<Table.Cell>{productPurchase.c_bpartner?.name}</Table.Cell>
												<Table.Cell>{productPurchase.vendorproductno}</Table.Cell>
												<Table.Cell
													>{formatNumber(
														productPurchase.pricelist,
														'sr-Latn',
														'decimal',
														undefined,
														2
													)}</Table.Cell
												>
												<Table.Cell>
													{#if productPurchase.url}
														<a
															href={productPurchase.url}
															target="_blank"
															class="btn btn-square btn-xs"
														>
															<SquareArrowOutUpRight />
														</a>
													{/if}
												</Table.Cell>
												<Table.Cell>
													<Button
														variant="ghost"
														onclick={() => deleteProductPORow(productPurchase.id)}
														type="button"
													>
														<X size={16} weight="bold" />
													</Button>
												</Table.Cell>
											</Table.Row>
										{/each} -->
			<!-- <Table.Row> -->
			<!-- <Table.Cell class="text-right">Add new:</Table.Cell>
											<Table.Cell>
												<Form.Field form={formPPO} name="c_bpartner_id">
													<Form.Control>
														<Select.Root
															selected={selectedVendor}
															onSelectedChange={(v) => {
																v && ($formProductPO.c_bpartner_id = v.value);
															}}
														>
															<Select.Trigger {...props}>
																<Select.Value placeholder="Select a vendor" />
															</Select.Trigger>
															<Select.Content class="max-h-80 overflow-auto">
																{#each data.c_bpartner as { value, label }}
																	<Select.Item {value} {label} />
																{/each}
															</Select.Content>
														</Select.Root>
														<input
															hidden
															bind:value={$formProductPO.c_bpartner_id}
															name={attrs.name}
														/>
													</Form.Control>
													<Form.FieldErrors />
												</Form.Field>
											</Table.Cell>
											<Table.Cell>
												<Form.Field form={formPPO} name="vendorproductno">
													<Form.Control>
														<Input
															{...props}
															bind:value={$formProductPO.vendorproductno}
															placeholder="Enter product number..."
														/>
													</Form.Control>
													<Form.FieldErrors />
												</Form.Field>
											</Table.Cell> -->
			<!-- 	<Table.Cell>
												<Form.Field form={formPPO} name="pricelist">
													<Form.Control>
														<Input
															{...props}
															type="number"
															step="0.01"
															bind:value={$formProductPO.pricelist}
															placeholder="Enter price..."
														/>
													</Form.Control>
													<Form.FieldErrors />
												</Form.Field>
											</Table.Cell> -->
			<!-- <Table.Cell colspan={2}>
												<Form.Field form={formPPO} name="url">
													<Form.Control>
														<Input
															{...props}
															bind:value={$formProductPO.url}
															placeholder="Enter URL..."
														/>
													</Form.Control>
													<Form.FieldErrors />
												</Form.Field>
											</Table.Cell>
											<Table.Cell>
												<Button type="submit" variant="secondary">Add</Button>
											</Table.Cell> -->
			<!-- </Table.Row>
									</Table.Body>
								</Table.Root>
							</div>
							<input type="hidden" name="m_product_id" bind:value={$formProduct.id} />
						</form>
					</Card.Content>
				</Card.Root> -->

                
		<!-- <Tabs.Content value="barcodes">
				{#if $formProduct.id}
					<ProductBarcodes
						formProductGtin={data.formProductGtin}
						formProductGtinId={data.formProductGtinId}
						barcodes={data.barcodes}
						productId={$formProduct.id}
					/>
				{/if}
			</Tabs.Content> -->

            			<!-- <Card.Root class="mb-2">
					<Card.Header>
						<Card.Title>Storage on hand by warehouse</Card.Title>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Warehouse</Table.Head>
									<Table.Head>Quantity</Table.Head>
									<Table.Head>Reservation</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each data.stock as stock}
									<Table.Row>
										<Table.Cell class="font-medium"
											>{data.warehouses.find((w) => w.value === stock.warehouse_id)
												?.label}</Table.Cell
										>
										<Table.Cell>{stock.qtyonhand}</Table.Cell>
										<Table.Cell>Nisam još ubacio</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root> -->
			<!-- <Card.Root class="mb-2">
					<Card.Header>
						<Card.Title>Sales by two week period</Card.Title>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									{#each data.salesByWeeks as week}
										<Table.Head>
											{formatDate(week.start_date)}
										</Table.Head>
									{/each}
								</Table.Row>
							</Table.Header>
							<Table.Body>
								<Table.Row>
									{#each data.salesByWeeks as week}
										<Table.Head>
											{week.total_izlaz}
										</Table.Head>
									{/each}</Table.Row
								>
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root> -->
			<!-- <Card.Root>
					<Card.Header>
						<Card.Title>Replenish Information</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="overflow-x-auto">
							<form method="post" action="?/modReplenish" use:enhanceReplenishUpd>
								<Table.Root>
									<Table.Header>
										<Table.Row>
											<Table.Head class="w-1/5">Warehouse</Table.Head>
											<Table.Head class="w-1/5">Min Level</Table.Head>
											<Table.Head class="w-1/5">Max Level</Table.Head>
											<Table.Head class="w-1/5">Batch Size</Table.Head>
											<Table.Head class="w-1/5">Source Warehouse</Table.Head>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{#each $formReplenishUpd.replenishes as replenish}
											<Table.Row>
												<Table.Cell class="w-1/5">
													<Select.Root
														selected={data.warehouses.find(
															(w) => w.value === replenish.m_warehouse_id
														)}
														onSelectedChange={(v) => {
															if (v) replenish.m_warehouse_id = v.value;
														}}
													>
														<Select.Trigger class="w-full">
															<Select.Value placeholder="Select warehouse" />
														</Select.Trigger>
														<Select.Content>
															{#each data.warehouses as warehouse}
																<Select.Item value={warehouse.value} label={warehouse.label} />
															{/each}
														</Select.Content>
													</Select.Root>
													<input hidden name="m_warehouse_id" bind:value={replenish.m_warehouse_id} />
												</Table.Cell>
												<Table.Cell class="w-1/5">
													<Input
														type="number"
														bind:value={replenish.level_min}
														placeholder="Min level..."
													/>
												</Table.Cell>
												<Table.Cell class="w-1/5">
													<Input
														type="number"
														bind:value={replenish.level_max}
														placeholder="Max level..."
													/>
												</Table.Cell>
												<Table.Cell class="w-1/5">
													<Input
														type="number"
														bind:value={replenish.qtybatchsize}
														placeholder="Batch size..."
													/>
												</Table.Cell>
												<Table.Cell class="w-1/5">
													<Select.Root 
													type="single"
													 name="m_warehousesource_id" 
													 bind:value={selectedWarehouseSourceValue}
														
													>
														<Select.Trigger>
															{triggerContentWarehouseSourceValue}
														</Select.Trigger>
														<Select.Content>
															{#each warehousesWithStringValues as warehouse}
																<Select.Item value={warehouse.value} label={warehouse.label} />
															{/each}
														</Select.Content>
													</Select.Root>
													
												</Table.Cell>
											</Table.Row>
										{/each}
									</Table.Body>
								</Table.Root>
								<Form.Button>Save</Form.Button>
								<Button
									variant="default"
									onclick={() => {
										if ($formProduct.id) {
											$formReplenishUpd.replenishes = [
												...$formReplenishUpd.replenishes,
												{
													ad_org_id: undefined,
													isactive: undefined,
													ad_client_id: undefined,
													m_warehouse_id: 0,
													m_product_id: $formProduct.id,
													level_max: undefined,
													level_min: undefined,
													m_locator_id: undefined,
													m_replenish_uu: undefined,
													m_warehousesource_id: undefined,
													qtybatchsize: undefined
												}
											];
										}
									}}>Add</Button
								>
							</form>
						</div>
					</Card.Content>
				</Card.Root> -->
			<!-- 	{#if browser}
					<SuperDebug data={$formReplenishUpd} />
				{/if} -->

                				<!-- <Form.Field form={productForm} name="net_qty_uom_id">
					<Form.Control>
						<Form.Label>Net Quantity UoM</Form.Label>
						<Select.Root
							selected={data.uom?.find((v) => v.value === $formProduct.net_qty_uom_id)}
							onSelectedChange={(v) => {
								v && ($formProduct.net_qty_uom_id = v.value);
							}}
						>
							<Select.Trigger {...props}>
								<Select.Value placeholder="Select Net Quantity UoM" />
							</Select.Trigger>
							<Select.Content>
								{#if data.uom}
									{#each data.uom as v}
										<Select.Item value={v.value} label={v.label} />
									{/each}
								{/if}
							</Select.Content>
						</Select.Root>
						<input hidden bind:value={$formProduct.net_qty_uom_id} name={props.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field> -->

				<!-- 	<Form.Field form={productForm} name="isactive">
					<Form.Control>
						<div class="flex items-center space-x-2">
							<Checkbox {...props} bind:checked={$formProduct.isactive as boolean} />
							<Form.Label>Is Active?</Form.Label>
						</div>
						<input name={attrs.name} value={$formProduct.isactive} hidden />
					</Form.Control>
				</Form.Field>
				<Form.Field form={productForm} name="isselfservice">
					<Form.Control>
						<div class="flex items-center space-x-2">
							<Checkbox {...props} bind:checked={$formProduct.isselfservice as boolean} />
							<Form.Label>Is Self Service?</Form.Label>
						</div>
						<input name={attrs.name} value={$formProduct.isselfservice} hidden />
					</Form.Control>
				</Form.Field> -->
				<!-- 	<Form.Field form={productForm} name="discontinued">
					<Form.Control>
						<div class="flex items-center space-x-2">
							<Checkbox {...props} bind:checked={$formProduct.discontinued as boolean} />
							<Form.Label>Discontinued?</Form.Label>
						</div>
						<input name={attrs.name} value={$formProduct.discontinued} hidden />
					</Form.Control>
				</Form.Field> -->
