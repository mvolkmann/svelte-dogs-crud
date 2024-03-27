<script lang="ts">
  import {onMount} from 'svelte';

  type Dog = {id: string; name: string; breed: string};

  let selectedDog: Dog | undefined = undefined;
  // let selectedDog = $state<Dog | undefined>(undefined);

  let dogMap = new Map<string, Dog>();
  // let dogMap = $state<Map<string, Dog>>(new Map<string, Dog>());

  onMount(async () => {
    // $effect(() => {
    loadDogs();
  });

  function addDog(dog: Dog) {
    const newDogMap = new Map(dogMap);
    dogMap.set(dog.id, dog);
    dogMap = dogMap; // triggers reactivity
  }

  function deleteDog(id: string) {
    const newDogMap = new Map(dogMap);
    dogMap.delete(id);
    dogMap = dogMap; // triggers reactivity
  }

  async function handleDelete(event: MouseEvent) {
    if (!confirm('Are you sure?')) return;

    const tr = event.target?.closest('tr');
    // It should never fail to find a `tr` that wraps the clicked button.
    if (!tr) throw new Error('tr not found');

    try {
      const res = await fetch(`/dogs/${tr.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('DELETE failed');
      deleteDog(tr.id);
    } catch (error) {
      console.error('Error deleting dog:', error);
    }
  }

  function handleEdit(event: MouseEvent) {
    const tr = event.target?.closest('tr');
    // It should never fail to find a `tr` that wraps the clicked button.
    if (!tr) throw new Error('tr not found');

    // This causes the name and breed of the selected dog
    // to appear in the form at the top.
    selectedDog = dogMap.get(tr.id);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const form = event.currentTarget;

    const url = selectedDog ? `/dogs/${selectedDog.id}` : '/dogs';
    try {
      const res = await fetch(url, {
        method: selectedDog ? 'PUT' : 'POST',
        body: new FormData(form)
      });
      if (!res.ok) throw new Error('POST failed');
      form.reset(); // clears the form inputs
      const newDog = await res.json();
      addDog(newDog);
      selectedDog = undefined;
    } catch (error) {
      console.error('POST failed:', error);
    }
  }

  async function loadDogs() {
    const res = await fetch('/dogs');
    const dogArray = await res.json();
    for (const dog of dogArray) {
      dogMap.set(dog.id, dog);
    }
    dogMap = dogMap; // triggers reactivity
  }
</script>

<main>
  <h1>Dogs</h1>
  <form on:submit={handleSubmit}>
    <div>
      <label for="name">Name</label>
      <input
        id="name"
        name="name"
        required
        size={30}
        type="text"
        value={selectedDog ? selectedDog.name : ''}
      />
    </div>
    <div>
      <label for="breed">Breed</label>
      <input
        id="breed"
        name="breed"
        required
        size={30}
        type="text"
        value={selectedDog ? selectedDog.breed : ''}
      />
    </div>
    <div class="buttons">
      <button id="submit-btn">{selectedDog ? 'Update' : 'Add'}</button>
      {#if selectedDog}
        <button type="button" on:click={() => (selectedDog = undefined)}>
          Cancel
        </button>
      {/if}
    </div>
  </form>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Breed</th>
      </tr>
    </thead>
    <tbody>
      {#each [...dogMap.values()] as dog (dog.id)}
        <tr class="on-hover" id={dog.id}>
          <td>{dog.name}</td>
          <td>{dog.breed}</td>
          <td class="buttons">
            <button class="show-on-hover" on:click={handleDelete} type="button">
              ✕
            </button>
            <!-- This selects the dog
                 which triggers a selection-change event,
                 which causes the form to update. -->
            <button class="show-on-hover" on:click={handleEdit} type="button">
              ✎
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<style>
  :global(body) {
    background-color: cornflowerblue;
    font-family: sans-serif;
  }

  button {
    background-color: lightgreen;
    border: none;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;

    &:disabled {
      background-color: gray;
    }
  }

  .buttons {
    display: flex;
    gap: 1rem;

    background-color: transparent;
  }

  h1 {
    color: black;
  }

  input {
    background-color: white;
    border: none;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.5rem;
  }

  label {
    display: inline-block;
    font-weight: bold;
    margin-right: 0.5rem;
    text-align: right;
    width: 3rem;
  }

  /* This is used for the table row delete and edit buttons. */
  .on-hover:hover .show-on-hover {
    visibility: visible;
  }

  /* This is used for the table row delete and edit buttons. */
  .show-on-hover {
    transform: scale(2.5) translate(0.2rem, 0.2rem);
    visibility: hidden;
  }

  table {
    border-collapse: collapse;
    margin-bottom: 0.5rem;
  }

  td,
  th {
    border: 1px solid cornflowerblue;
    padding: 0.5rem;
  }

  td {
    background-color: white;

    & button {
      background-color: transparent;
      color: white;
    }
  }

  th {
    background-color: orange;
  }
</style>
