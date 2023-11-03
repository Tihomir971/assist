<script lang="ts">
	export let thumbImg: string;
	export let altTag: string;
	export let titleLink: string;
	export let id: number | null | undefined;
	export let selected: any;
	$: imageId = id?.toString();
</script>

<div class="thumbnail-cont">
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img
		class="sample cursor"
		class:active={selected}
		id={imageId}
		src={thumbImg}
		alt={altTag}
		title="Image from {titleLink}"
		on:click
		on:keyup
	/>
</div>

<style>
	/* Six columns side by side */
	.thumbnail-cont {
		width: 16.66%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #ddd;
	}

	/* Add a transparency effect for thumnbail images */
	.sample {
		opacity: 0.4;
	}

	.sample:hover {
		opacity: 1;
	}

	img {
		width: 100%;
		height: 100%;
		transition: all 0.1s ease-in-out;
	}

	/* Add a pointer when hovering over the thumbnail images */
	.cursor {
		cursor: pointer;
	}

	.active {
		opacity: 1;
		padding: 5px;
		width: 85%;
		height: 85%;
	}
</style>
