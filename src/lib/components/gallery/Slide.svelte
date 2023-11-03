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

<style>
	/* Number text (1/3 etc) */
	.numbertext {
		color: #f2f2f2;
		font-size: 0.9rem;
		padding: 8px 12px;
		text-shadow: 1px 1px black;
		position: absolute;
		top: 0;
	}

	img {
		width: 100%;
	}
	.image-wrapper {
		position: relative;
		width: 100%; /* You can set this to any desired width */
		padding-bottom: 100%; /* Maintain the 1:1 aspect ratio */
		overflow: hidden; /* To make sure the image doesn't expand the parent div */
	}
	.aspect-ratio-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: scale-down; /* This will make sure the image covers the entire wrapper div, while maintaining its aspect ratio */
	}
</style>
