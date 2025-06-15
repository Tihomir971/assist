export const traditionalCode = `<!-- 50+ lines of repetitive code -->
<form method="POST" use:enhance>
  <div class="field">
    <label>Name</label>
    <input bind:value={name} />
    {#if errors.name}
      <span class="error">{errors.name}</span>
    {/if}
  </div>
  <!-- Repeat for each field... -->
  <button type="submit">Save</button>
</form>

<script>
  // Manual validation logic
  // Manual state management
  // Manual error handling
  // 100+ lines of boilerplate
</script>`;

export const phase2bCode = `<!-- Just 5 lines! -->
<SmartForm 
  {form}
  {schema}
  action="?/save"
  entityName="User"
  {config}
  onSuccess={handleSuccess}
/>

<script>
  // Schema defines everything
  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email()
  });
  
  // Configuration is optional
  const config = { layout: 'two-column' };
</script>`;
