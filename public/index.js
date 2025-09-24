console.log('hello world');
var btn = document.getElementById('bestButtonEver');

btn.addEventListener('click', ()=> {
    const elements = document.getElementsByTagName('h1');
    Array.from(elements).forEach(element => {
        element.style = 'color: yellow';
    });
});