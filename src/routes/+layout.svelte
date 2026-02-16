<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$themes/global.css';

	import { config } from '../../moire.config';
  import { init, trackEvent } from '@aptabase/web';
  import { page } from '$app/state';

	let { children } = $props();

  init('A-US-7287213050');

	$effect(() => {
		document.body.classList.add(config.theme);
		return () => document.body.classList.remove(config.theme);
	});

  $effect(() => {
    trackEvent('page_view', { path: page.url.pathname });
  });
</script>

<svelte:head>
	<title>{config.title}{config.description ? ` | ${config.description}` : ''}</title>
	<meta name="description" content={config.description} />
	<meta name="author" content={config.author} />
	<meta name="keywords" content={config.keywords} />
	<link rel="icon" href={favicon} />
  <link rel="canonical" href={config.url} />

  <meta property="og:type" content="website" />
  <meta property="og:url" content={config.url} />
  <meta property="og:title" content={config.title} />
  <meta property="og:description" content={config.description} />
  <meta property="og:image" content="{config.url}/icon.png" />

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content={config.url} />
  <meta property="twitter:title" content={config.title} />
  <meta property="twitter:description" content={config.description} />
  <meta property="twitter:image" content="{config.url}/icon.png" />

</svelte:head>

{@render children()}
