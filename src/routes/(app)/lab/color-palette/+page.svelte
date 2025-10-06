<script lang="ts">
	import type { PageData } from '../$types';

	let { data }: { data: PageData } = $props();
</script>

<section class="relative size-full overflow-hidden p-4 pt-1">
	<div class="relative isolate size-full overflow-hidden rounded-lg border">
		<div
			class="m-0 size-full ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
		>
			<div class="space-y-4 @max-3xl:space-y-2">
				<h3 class="text-sm font-semibold text-muted-foreground">Primary Theme Colors</h3>
				<div class="@6xl grid grid-cols-1 gap-2 @sm:grid-cols-2 @2xl:grid-cols-3 @4xl:grid-cols-4">
					<div
						class="group/color-preview relative flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-muted/60"
					>
						<div class="size-14 shrink-0 rounded-md border bg-error @max-3xl:size-12"></div>
						<div class="flex-1 space-y-1 overflow-hidden">
							<p class="line-clamp-2 text-sm leading-tight font-medium @max-3xl:text-xs">Error</p>
						</div>
					</div>
					<div class="bg-warning">Warning</div>
					<div class="bg-info">Info</div>
				</div>
			</div>
			<div class="bg-background text-foreground">Background</div>
			<div class="bg-card text-card-foreground">Card</div>
			<div class="bg-popover text-popover-foreground">Popover</div>
			<div class="bg-primary text-primary-foreground">Primary</div>
			<div class="bg-secondary text-secondary-foreground">Secondary</div>
			<div class="bg-muted text-muted-foreground">Muted</div>
			<div class="bg-accent text-accent-foreground">Accent</div>
			<div class="bg-destructive text-destructive-foreground">Destructive</div>
			<div class="bg-border">Border</div>
			<div class="bg-input">Input</div>
			<div class="bg-ring">Ring</div>
		</div>
	</div>
</section>
