<script lang="ts">
  type Props = {
    html: string;
    class?: string;
    title?: string;
    height?: number | string;
  };

  let {
    html,
    class: className = "",
    title = "Preview",
    height = 480,
  }: Props = $props();

  let frameHeight = $derived(typeof height === "number" ? `${height}px` : height);
</script>

<iframe
  {title}
  srcdoc={html}
  sandbox="allow-same-origin"
  class={className}
  style={`width: 100%; height: ${frameHeight}; border: 0;`}
></iframe>
