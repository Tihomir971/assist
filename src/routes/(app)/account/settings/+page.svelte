<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { SelectLookupZag } from '$lib/components/zag';
	import { setUserMetadata } from './data.remote';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto space-y-6 py-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold">Account Settings</h1>
		<p class="text-muted-foreground">Manage your account preferences and settings.</p>
	</div>

	<Separator />

	<div class="grid gap-6">
		<!-- Localization Preferences -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Data Localization Preferences</Card.Title>
				<Card.Description>
					Choose the language for displaying data content (product names, categories, etc.)
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form {...setUserMetadata}>
					<SelectLookupZag
						{...setUserMetadata.fields.preferred_locale.as('text')}
						name="preferred_locale"
						value={data.user?.user_metadata.preferred_locale}
						items={data.localePreferences.availableLocales}
						label="User preferred Language"
					/>
					<Button type="submit" class="mt-4">Save Changes</Button>
				</form>
			</Card.Content>
			<Card.Footer>
				<p>Card Footer</p>
			</Card.Footer>
		</Card.Root>

		<!-- Future settings cards can be added here -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Other Settings</Card.Title>
				<Card.Description>Additional account settings will be available here.</Card.Description>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">Coming soon...</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
