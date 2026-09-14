<script lang="ts">
  import type {
    DokuCheckoutInput,
    DokuCheckoutResult,
    DokuDirectInput,
    DokuDirectResult,
    PaymentCustomer,
    PaymentInstructions,
  } from "@/features/payment/lib/contracts";
  import DokuDirectForm from "./DokuDirectForm.svelte";
  import DokuPaymentInstructions from "./DokuPaymentInstructions.svelte";
  import DokuCheckout from "./providers/DokuCheckout.svelte";

  export type CheckoutPageCopy = {
    heading: string;
    subheading: string;
    quickTitle: string;
    directTitle: string;
  };

  const DEFAULT_COPY: CheckoutPageCopy = {
    heading: "Checkout",
    subheading: "Pick the fast hosted flow, or choose your own channel.",
    quickTitle: "Quick checkout",
    directTitle: "Choose your own channel",
  };

  let {
    amount = 150_000,
    orderId = "ord_demo",
    customer = { name: "Demo User", email: "demo@example.com" },
    callbackUrl = undefined,
    allowedChannels = undefined,
    copy = {},
    onCheckout = undefined,
    onDirectSubmit = undefined,
  } = $props<{
    amount?: number;
    orderId?: string;
    customer?: PaymentCustomer;
    callbackUrl?: string;
    allowedChannels?: string[];
    copy?: Partial<CheckoutPageCopy>;
    onCheckout?: (input: DokuCheckoutInput) => Promise<DokuCheckoutResult>;
    onDirectSubmit?: (input: DokuDirectInput) => Promise<DokuDirectResult>;
  }>();

  let result = $state<{ channel: string; instructions: PaymentInstructions; expiresAt?: number } | null>(null);
  let strings = $derived({ ...DEFAULT_COPY, ...copy });
</script>

<main class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
  <header>
    <h1 class="text-2xl font-semibold">{strings.heading}</h1>
    <p class="text-sm text-muted-foreground">{strings.subheading}</p>
  </header>

  {#if result}
    <DokuPaymentInstructions channel={result.channel} instructions={result.instructions} expiresAt={result.expiresAt} />
  {:else}
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">{strings.quickTitle}</h2>
        <DokuCheckout {amount} {orderId} {customer} {callbackUrl} paymentMethods={allowedChannels} {onCheckout} />
      </section>
      <section class="flex flex-col gap-2">
        <h2 class="text-sm font-medium uppercase tracking-wide text-muted-foreground">{strings.directTitle}</h2>
        <DokuDirectForm
          {amount}
          {orderId}
          defaultCustomer={customer}
          {allowedChannels}
          onSubmit={onDirectSubmit}
          onSuccess={(next) => (result = next)}
        />
      </section>
    </div>
  {/if}
</main>
