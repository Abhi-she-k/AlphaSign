export async function POST(request: Request) {  

    const data = await request.json();

    const screenshot = data.screenshot
    const request_option = data.request_option

    const response = await fetch("http://0.0.0.0:8000/process_image", {
        
        
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ screenshot: screenshot, request_option: request_option }),
        
    });

    const image_process_reponse = await response.json();

    return new Response(JSON.stringify(image_process_reponse))
}