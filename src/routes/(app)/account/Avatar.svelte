<!-- src/routes/account/Avatar.svelte -->
<script lang="ts">
	import type { Database } from '$lib/types/supabase.types';
	import type { SupabaseClient } from '@supabase/supabase-js';

	interface Props {
		size?: number;
		url: string | null;
		supabase: SupabaseClient<Database>;
	}

	let { size = 10, url = $bindable(), supabase }: Props = $props();

	let avatarUrl: string | null = $state(null);
	let uploading = $state(false);
	let files: FileList | undefined = $state();

	const downloadImage = async (path: string) => {
		try {
			const { data, error } = await supabase.storage.from('avatars').download(path);

			if (error) {
				throw error;
			}

			const url = URL.createObjectURL(data);
			avatarUrl = url;
		} catch (error) {
			if (error instanceof Error) {
				console.log('Error downloading image: ', error.message);
			}
		}
	};

	const uploadAvatar = async () => {
		try {
			uploading = true;

			if (!files || files.length === 0) {
				throw new Error('You must select an image to upload.');
			}

			const file = files[0];
			const fileExt = file.name.split('.').pop();
			const filePath = `${Math.random()}.${fileExt}`;

			const { error } = await supabase.storage.from('avatars').upload(filePath, file);

			if (error) {
				throw error;
			}

			url = filePath;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			uploading = false;
		}
	};

	$effect(() => {
		if (url) downloadImage(url);
	});
</script>

<div>
	{#if avatarUrl}
		<img
			src={avatarUrl}
			alt={avatarUrl ? 'Avatar' : 'No image'}
			class="avatar image"
			style="height: {size}em; width: {size}em;"
		/>
	{:else}
		<div class="avatar no-image" style="height: {size}em; width: {size}em;"></div>
	{/if}
	<input type="hidden" name="avatarUrl" value={url} />

	<div style="width: {size}em;">
		<label class="button primary block" for="single">
			{uploading ? 'Uploading ...' : 'Upload'}
		</label>
		<input
			style="visibility: hidden; position:absolute;"
			type="file"
			id="single"
			accept="image/*"
			bind:files
			onchange={uploadAvatar}
			disabled={uploading}
		/>
	</div>
</div>
