<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/nunito';
	import '@fontsource-variable/merriweather';
	import '@fontsource-variable/fira-code';

	import { invalidate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ModeWatcher } from 'mode-watcher';
	import { LocaleProvider } from '@ark-ui/svelte/locale';
	import 'iconify-icon';

	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	$effect(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

<ModeWatcher />
<Toaster position="bottom-center" richColors />

<LocaleProvider locale="sr-RS">
	{@render children?.()}
</LocaleProvider>
