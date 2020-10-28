const FORM = document.getElementById('form');
const URL = document.getElementById('url');
const SLUG = document.getElementById('slug');
const submit = document.getElementById('submit');
const showbox = document.getElementById('showbox');

const formItems = [ URL, SLUG ];
let state = {
    url: '',
    slug: '',
    created: null
}

formItems.forEach(item => {
    item.addEventListener('keyup', (event) => {
        let name = event.target.name;
        let value = event.target.value;
        state[name] = value;
    });
});

const handleOnSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:2020/url', {
        method: 'POST',
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            url: state.url,
            slug: state.slug
        })
    });

    state.created = await response.json();
    console.log(state.created);
    if(state.created.message) showbox.innerHTML = state.created.message;
    else showbox.innerHTML = `<a href="http://localhost:2020/${state.created.slug}" target="_blank">/${state.created.slug}</a>`;
}

submit.addEventListener('click', handleOnSubmit);

