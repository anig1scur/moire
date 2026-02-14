<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$themes/global.css';

	import { config } from '../../moire.config';

	let { children } = $props();

	$effect(() => {
		document.body.classList.add(config.theme);
		return () => document.body.classList.remove(config.theme);
	});
</script>

<svelte:head>
	<title>{config.title}{config.description ? ` | ${config.description}` : ''}</title>
	<meta name="description" content={config.description} />
	<meta name="author" content={config.author} />
	<meta name="keywords" content={config.keywords} />
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
