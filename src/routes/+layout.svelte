<script>
	import '../app.css';
	import '@fontsource-variable/nunito-sans';

	import { invalidate } from '$app/navigation';
	import { Toaster } from '$lib/components/ui/sonner';

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

<Toaster position="bottom-center" richColors />

{@render children()}
