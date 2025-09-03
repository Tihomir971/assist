<script lang="ts">
	import type { PageData } from './$types';
	import LocalePreferencesCard from '$lib/components/settings/LocalePreferencesCard.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';

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
		<LocalePreferencesCard
			availableLocales={data.localePreferences.availableLocales}
			bind:currentLocale={data.localePreferences.preferredDataLocale}
		/>

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
