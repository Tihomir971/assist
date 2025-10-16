<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { SelectLookupZag } from '$lib/components/zag';
	import { setUserMetadata } from './data.remote';
	import { Button } from '$lib/components/ui/button/index.js';
	import { LOCALES, TIMEZONES } from '$lib/constants/locales';
	import Avatar from './Avatar.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto max-w-5xl space-y-6 py-6">
	<div class="space-y-2">
		<h1 class="text-3xl font-bold">Account Settings</h1>
		<p class="text-muted-foreground">Manage your account preferences and settings.</p>
	</div>
	<Separator />
	<Avatar supabase={data.supabase} url={data.profile?.avatar_url} size={5} />
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
				<form {...setUserMetadata} class="grid gap-6">
					<SelectLookupZag
						label="User preferred Language"
						name="locale"
						value={data.app.userLocale}
						items={LOCALES.map((locale) => ({
							value: locale.code,
							label: `${locale.name} - ${locale.nativeName}`
						})).sort((a, b) => a.label.localeCompare(b.label))}
					/>
					{#each setUserMetadata.fields.locale.issues() as issue}
						<p class="issue">{issue.message}</p>
					{/each}
					<SelectLookupZag
						label="User timezone"
						name="timezone"
						value={data.user?.user_metadata.timezone}
						items={TIMEZONES.map((timezone) => ({
							value: timezone.code,
							label: `${timezone.code} - ${timezone.offset}`
						})).sort((a, b) => a.label.localeCompare(b.label))}
					/>
					{#each setUserMetadata.fields.timezone.issues() as issue}
						<p class="issue">{issue.message}</p>
					{/each}
					<Button type="submit" class="mt-4">Save Changes</Button>
				</form>
			</Card.Content>
			<Card.Footer></Card.Footer>
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
