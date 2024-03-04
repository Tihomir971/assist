<script lang="ts">
	import Thumbnails from './Thumbnails.svelte';

	let elemCarousel: HTMLDivElement;

	export let images: (string | null)[];
	$: console.log('images', images);
	function carouselLeft(): void {
		const x =
			elemCarousel.scrollLeft === 0
				? elemCarousel.clientWidth * elemCarousel.childElementCount // loop
				: elemCarousel.scrollLeft - elemCarousel.clientWidth; // step left
		elemCarousel.scroll(x, 0);
	}

	function carouselRight(): void {
		const x =
			elemCarousel.scrollLeft === elemCarousel.scrollWidth - elemCarousel.clientWidth
				? 0 // loop
				: elemCarousel.scrollLeft + elemCarousel.clientWidth; // step right
		elemCarousel.scroll(x, 0);
	}
	function carouselThumbnail(index: number) {
		elemCarousel.scroll(elemCarousel.clientWidth * index, 0);
	}
</script>

<div class="bg-layer-2 shadow-1 flex w-full flex-col">
	<!-- Carousel -->
	<div class="card grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
		<!-- Button: Left -->
		<button type="button" class="btn-icon variant-filled" on:click={carouselLeft}>
			<iconify-icon icon="ph:caret-circle-left-bold" width="24" height="24"></iconify-icon>
		</button>
		<!-- Full Images -->
		<div bind:this={elemCarousel} class="flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
			{#each images as image}
				<img
					class="rounded-container-token w-[1024px] snap-center"
					src={image}
					alt={image}
					loading="lazy"
				/>
			{/each}
		</div>
		<!-- Button: Right -->
		<button type="button" class="btn-icon variant-filled" on:click={carouselRight}>
			<iconify-icon icon="ph:caret-circle-right-bold" width="24" height="24"></iconify-icon>
		</button>
	</div>
	<!-- Thumbnails -->
	<Thumbnails {images} on:select={(e) => carouselThumbnail(e.detail.i)}></Thumbnails>
</div>
