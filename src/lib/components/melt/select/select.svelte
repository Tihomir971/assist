<script lang="ts">
 //   import { Check } from '$icons/index.js';
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import Check from "lucide-svelte/icons/check";
    import { createSelect, melt } from '@melt-ui/svelte';
    import { fade } from 'svelte/transition';
  
    const options = {
      sweet: ['Caramel', 'Chocolate', 'Strawberry', 'Cookies & Cream'],
    };
  
    const {
      elements: { trigger, menu, option, group, groupLabel, label },
      states: { selectedLabel, open },
      helpers: { isSelected },
    } = createSelect<string>({
      forceVisible: true,
      positioning: {
        placement: 'bottom',
        fitViewport: true,
        sameWidth: true,
      },
    });
  </script>
  
  <div class="flex flex-col gap-1">
    <!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
    <label class="block text-violet-900" use:melt={$label}>Favorite Flavor</label>
    <button
      class="flex h-10 min-w-[220px] items-center justify-between rounded-lg bg-white px-3 py-2
    text-violet-700 shadow transition-opacity hover:opacity-90"
      use:melt={$trigger}
      aria-label="Food"
    >
      {$selectedLabel || 'Select a flavor'}
      <ChevronDown class="size-5" />
    </button>
    {#if $open}
      <div
        class=" z-10 flex max-h-[300px] flex-col
      overflow-y-auto rounded-lg bg-white p-1
      shadow focus:!ring-0"
        use:melt={$menu}
        transition:fade={{ duration: 150 }}
      >
        {#each Object.entries(options) as [key, arr]}
          <div use:melt={$group(key)}>
            <div
              class="py-1 pl-4 pr-4 font-semibold capitalize text-neutral-800"
              use:melt={$groupLabel(key)}
            >
              {key}
            </div>
            {#each arr as item}
              <div
                class="relative cursor-pointer rounded-lg py-1 pl-8 pr-4 text-neutral-800
                hover:bg-violet-100 focus:z-10
                focus:text-violet-700
                data-[highlighted]:bg-violet-200 data-[highlighted]:text-violet-900
                data-[disabled]:opacity-50"
                use:melt={$option({ value: item, label: item })}
              >
                <div class="check {$isSelected(item) ? 'block' : 'hidden'}">
                  <Check class="size-4" />
                </div>
  
                {item}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  
  <style lang="postcss">
    .check {
      position: absolute;
      left: theme(spacing.2);
      top: 50%;
      z-index: theme(zIndex.20);
      translate: 0 calc(-50% + 1px);
      color: theme(colors.violet.500);
    }
  </style>