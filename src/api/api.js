


export async function getCunk(index){
    console.log("starting request...");
    const Http = new XMLHttpRequest();
    const url = 'https://localhost:7037/api/contacts/GetChunk?startIndex='+index+'&chunkSize=30'
    Http.open("GET", url)
    Http.send();
    Http.onreadystatechange=()=>{
        if(this.reacyState===4 && this.status===200)
            console.log(Http.responseText);
    }
}
