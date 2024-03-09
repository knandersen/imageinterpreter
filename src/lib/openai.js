import OpenAI from "openai";


// Function to describe an image using its base64 representation
export async function base64toDesc(base64_image, prompt, key) {
    const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
    console.log("completing...")
    const str = `${base64_image}`
    // console.log(str)
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        max_tokens: 4096,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            "url": str,
                            "detail": "low"
                        },
                    },
                ],
            },
        ],
    });
    // console.log(response.choices[0])
    return response.choices[0].message.content;
}

export function downloadStringAsFile(content, fileName) {
    // Create a Blob with the content and specify the file type
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor (link) element
    const a = document.createElement('a');

    // Set the download attribute to the filename you want
    a.download = fileName;

    // Set the href to the Blob URL
    a.href = url;

    // Append the anchor to the body (it does not need to be visible)
    document.body.appendChild(a);

    // Programmatically trigger the click event
    a.click();

    // Clean up by removing the temporary anchor and revoking the Blob URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}