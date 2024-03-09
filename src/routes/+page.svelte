<script>
    import Dropzone from "svelte-file-dropzone";
    import { filesBase64, userPrompt, busy, apiKey } from "$lib/store";
    import { base64toDesc, downloadStringAsFile } from "$lib/openai.js";
    import { onMount } from "svelte";

    onMount(() => {
        if (localStorage.getItem("apiKey")) {
            $apiKey = localStorage.getItem("apiKey");
        }
    });

    const saveKey = () => {
        localStorage.setItem("apiKey", $apiKey);
    };

    let files = {
        accepted: [],
        rejected: [],
    };

    async function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () =>
                resolve({ base64: reader.result, name: file.name });
            reader.onerror = (error) => reject(error);
        });
    }

    async function handleFilesSelect(e) {
        const { acceptedFiles, fileRejections } = e.detail;
        files.accepted = [...files.accepted, ...acceptedFiles];
        files.rejected = [...files.rejected, ...fileRejections];

        for (let i = 0; i < files.accepted.length; i++) {
            $busy = true;
            const base64 = await fileToBase64(files.accepted[i]);
            const desc = await base64toDesc(
                base64.base64,
                $userPrompt,
                $apiKey,
            );
            $busy = false;
            files.accepted[i].base64 = base64.base64;
            files.accepted[i].desc = desc;
        }

        $filesBase64 = files.accepted;
    }

    const download = (content, filename) => {
        filename = filename.split(".")[0] + ".desc";
        downloadStringAsFile(content, filename);
    };
</script>

<article class="max-w-[1024px] mx-auto py-8 flex flex-col gap-8">
    <div>
        <input
            type="text"
            bind:value={$apiKey}
            placeholder="sk-"
            class="p-2 border w-full"
        />
        <button on:click={saveKey}>save key in local storage</button>
    </div>
    <div>
        <p class="font-bold">system prompt:</p>
        <input type="text" bind:value={$userPrompt} class="p-2 border w-full" />
    </div>
    <Dropzone on:drop={handleFilesSelect} />
    {#if $busy}
        <p class="animate-bounce">retrieving description from openai...</p>
    {:else}
        <p>&nbsp;</p>
    {/if}
    <div id="images" class="grid gap-2">
        <div class="header">image</div>
        <div class="header">file name</div>
        <div class="header">description</div>
        <div class="header">download</div>
        {#each $filesBase64 as file}
            <!-- image tag based on base64 data with prefix-->
            <div><img src={file.base64} /></div>
            <div>{file.name}</div>
            <div>
                {#if file.desc}
                    {file.desc}
                {:else}
                    loading...
                {/if}
            </div>
            <div>
                <button on:click={() => download(file.desc, file.name)}>
                    download
                </button>
            </div>
        {/each}
    </div>
</article>

<style>
    .header {
        @apply font-bold bg-slate-300 p-2;
    }

    #images {
        grid-template-columns: 1fr 1fr 3fr 1fr;
    }

    button {
        @apply border rounded-2xl p-2 bg-slate-100 m-2;
    }
</style>
