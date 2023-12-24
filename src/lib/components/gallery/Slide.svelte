<script lang="ts">
	export let slideNo: number;
	export let totalSlides: number;
	export let slideImageURL: string;
	export let altTag: string = 'altTag';
	export let attr: string = 'attr';
</script>

<!-- Full-width images with number text -->
<div class="image-wrapper">
	<div class="numbertext">{slideNo} / {totalSlides}</div>
	<img class="aspect-ratio-image" src={slideImageURL} alt={altTag} title={attr} />
</div>
