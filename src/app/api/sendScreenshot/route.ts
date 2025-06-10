


export async function POST(request: Request) {  

    const data = await request.json();

    const response = await fetch("http://0.0.0.0:8000/process_image", {
        
        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ photo: data.screenshot }),
        
    });

    const letter = await response.json();

    return new Response(JSON.stringify({ response: await letter.response }))
}