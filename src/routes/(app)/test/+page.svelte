<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<div class="container mx-auto flex flex-col gap-4 p-4">
	<h1 class="mb-6 text-2xl font-bold">Test Pages</h1>

	<div class="grid gap-4">
		<a href="/test/input-components" class="no-underline">
			<Button variant="outline" class="w-full justify-start">Input Components Demo</Button>
		</a>

		<!-- Add other test pages here as needed -->
	</div>
	<div class="flex gap-1 *:rounded *:p-1">
		<div class="aspect-square size-20 bg-(--color-1) text-surface-2">1</div>
		<div class="aspect-square size-20 bg-(--color-2) text-surface-2">2</div>
		<div class="aspect-square size-20 bg-(--color-3) text-surface-2">3</div>
		<div class="aspect-square size-20 bg-(--color-4) text-surface-2">4</div>
		<div class="aspect-square size-20 bg-(--color-5)">5</div>
		<div class="aspect-square size-20 bg-(--color-6)">6</div>
		<div class="aspect-square size-20 bg-(--color-7)">7</div>
		<div class="aspect-square size-20 bg-(--color-8)">8</div>
		<div class="aspect-square size-20 bg-(--color-9)">9</div>
		<div class="aspect-square size-20 bg-(--color-10)">10</div>
		<div class="aspect-square size-20 bg-(--color-11)">11</div>
		<div class="aspect-square size-20 bg-(--color-12)">13</div>
		<div class="aspect-square size-20 bg-(--color-13)">13</div>
		<div class="aspect-square size-20 bg-(--color-14)">14</div>
		<div class="aspect-square size-20 bg-(--color-15)">15</div>
		<div class="aspect-square size-20 bg-(--color-16)">16</div>
	</div>
	<div class="flex justify-center gap-2 *:rounded *:p-1">
		<div class="aspect-square size-20 bg-(--color-max)">Max</div>
		<div class="aspect-square size-20 bg-(--color-primary)">Primary</div>
		<div class="aspect-square size-20 bg-(--error)">error</div>
		<div class="aspect-square size-20 bg-(--ok)">ok</div>
		<div class="aspect-square size-20 bg-(--good)">good</div>
		<div class="aspect-square size-20 bg-(--warning)">warning</div>
	</div>
	<div
		class="flex justify-center gap-2 *:size-40 *:rounded-xl *:border *:border-surface-2 *:p-2 *:shadow-3"
	>
		<div class="bg-surface-3">Surface 3</div>
		<div class="bg-surface-2">Surface 2</div>
		<div class="bg-surface-1">Surface 1</div>
		<div class="bg-surface-document">document</div>
		<div class="bg-well-1">Well 1</div>
		<div class="bg-well-2">Well 2</div>
	</div>
	<div
		class="flex justify-center gap-2 *:size-40 *:rounded *:border *:border-surface-2 *:bg-surface-1 *:p-2"
	>
		<div class="">Shadow 0</div>
		<div class="shadow-1">Shadow 1</div>
		<div class="shadow-2">Shadow 2</div>
		<div class="shadow-3">Shadow 3</div>
		<div class="shadow-4">Shadow 4</div>
		<div class="shadow-5">Shadow 5</div>
		<div class="shadow-6">Shadow 6</div>
	</div>
	<!-- 	<div class="flex">
		<div class="aspect-square size-20 bg-(--gray-0)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-1)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-2)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-3)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-4)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-5)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-6)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-7)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-8)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-9)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-10)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-11)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-12)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-13)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-14)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-15)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-16)">Hello</div>
		<div class="aspect-square size-20 bg-(--gray-16)">Hello</div>
	</div> -->
</div>
