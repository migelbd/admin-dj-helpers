document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('resize', setViewportHeight);
    setViewportHeight()

    initScrollLinks();
    initDataUrls();
})

function initDataUrls() {
    const dataUrl = document.querySelectorAll('[data-url]');
    dataUrl.forEach(function (element) {
        element.classList.add('url-element');
        element.addEventListener('click', function (e) {
            if (!e.target.classList.contains('copy-inline-button')) {
                if (e.metaKey || e.ctrlKey || e.altKey)
                    window.open(element.dataset.url, '_blank');
                else
                    window.open(element.dataset.url, '_parent');
            }

        })
    })
}

function initScrollLinks() {
    const scrollLinks = document.querySelectorAll('[data-scroll-to]');
    scrollLinks.forEach(function (element) {
        element.style.cursor = 'pointer';
        element.addEventListener('click', function (e) {
            let targetId = e.target.dataset.scrollTo;
            if (!targetId)
                targetId = e.target.closest('[data-scroll-to]').dataset.scrollTo;

            const target = document.querySelector(`[data-scroll-id="${targetId}"]`)
            if (!target)
                return
            const detailsTag = target.closest('details')
            if (detailsTag) {
                detailsTag.open = true;
            }
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
            let parent = target.closest('[data-is-container]');

            if (!parent)
                parent = target.closest('fieldset');
            parent.style.backgroundColor = 'var(--accent)'
            parent.style.transition = 'background-color 0.8s ease-in-out';
            setTimeout(() => {
                parent.style.backgroundColor = '';
            }, 500)

        })
    })
}


function setViewportHeight() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh-screen', `${vh}px`);
}




