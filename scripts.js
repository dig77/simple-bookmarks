const list = document.querySelector('ul');
const form = document.querySelector('form');
const sparks = document.querySelectorAll('.spark');
const overlay = document.querySelector('.overlay');
const creationArea = document.querySelector('.form-area');

const toggler = () => {
    creationArea.classList.toggle('show-it');
    overlay.classList.toggle('visible');
};

const addBookmark = (bookmark, id) => {
    let html = `
        <li class="mt-4" data-id="${id}">
            <div class="card shadow-sm">
                <h5 class="card-header is-time text-muted">
                    ${bookmark.created_at.toDate()}
                </h5>
                <div class="card-body">
                    <h5 class="card-title">${bookmark.title}</h5>
                    <div class="d-flex align-items-center">
                        <a href="${bookmark.url}" class="btn btn-primary btn-sm mr-4" target="_blank">Open</a>
                        <button class="btn btn-danger btn-sm ms-3">Delete</button>
                    </div>
                </div>
            </div> 
        </li>
    `
    list.innerHTML += html;
};

const deleteBookmark = id => {
    const bookmarks = document.querySelectorAll('li');
    bookmarks.forEach(bookmark => {
        if (bookmark.getAttribute('data-id') === id) {
            bookmark.remove();
        }
    })
};

// get data from database
db.collection('bookmarks')
    .orderBy('created_at','desc')
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            if (change.type === 'added') {
                addBookmark(doc.data(), doc.id);
            } else if (change.type === 'removed') {
                deleteBookmark(doc.id);
            }
        })
    });

sparks.forEach(spark => {
    spark.addEventListener('click', () => {
        toggler();
    })
});

overlay.addEventListener('click', () => {
    toggler();
});

// add documents
form.addEventListener('submit', e => {
    e.preventDefault();

    const now = new Date();
    const bookmark = {
        title: form.title.value,
        url: form.url.value,
        created_at: firebase.firestore.Timestamp.fromDate(now)
    };

    db.collection('bookmarks').add(bookmark).then(() => {
        console.log('bookmark added');
    }).catch(err => {
        console.log(err);
    });

    form.reset();
    toggler();
});

// delete data
list.addEventListener('click', e => {
    // console.log("🚀 ~ file: scripts.js ~ line 86 ~ e", e.target)

    if (e.target.tagName === 'BUTTON') {
        const id = e.target.parentElement.parentElement.parentElement.parentElement.getAttribute('data-id');
        db.collection('bookmarks').doc(id).delete().then(() => {
            console.log('bookmark deleted');
        }).catch(err => {
            console.log(err);
        });
    }
});