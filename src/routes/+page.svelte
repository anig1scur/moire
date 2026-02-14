<script lang="ts">
    import type { PageData } from './$types';
    import { config } from '../../moire.config';
    
    let { data }: { data: PageData } = $props();
    let ThemeComponent = $state<any>(null);

    // __MOIRE_THEME__ is replaced at build time by Vite define (from moire.config.ts)
    // Only the matching branch survives dead-code elimination
    let loader: () => Promise<any>;
    if (__MOIRE_THEME__ === 'receipt') {
        loader = () => import('$themes/receipt/index.svelte');
    } else if (__MOIRE_THEME__ === 'cyberpunk') {
        loader = () => import('$themes/cyberpunk/index.svelte');
    } else if (__MOIRE_THEME__ === 'academic') {
        loader = () => import('$themes/academic/index.svelte');
    } else if (__MOIRE_THEME__ === 'bento') {
        loader = () => import('$themes/bento/index.svelte');
    } else if (__MOIRE_THEME__ === 'pixel') {
        loader = () => import('$themes/pixel/index.svelte');
    } else if (__MOIRE_THEME__ === 'classic') {
        loader = () => import('$themes/classic/index.svelte');
    } else {
        loader = () => import('$themes/receipt/index.svelte');
    }
    
    loader().then(module => {
        ThemeComponent = module.default;
    });
</script>

{#if ThemeComponent}
    <ThemeComponent {data} {config} />
{:else}
    <!-- Simple loading state to avoid flash -->
    <div class="min-h-screen flex items-center justify-center">Loading...</div>
{/if}

