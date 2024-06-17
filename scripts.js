const API_URL = "http://servicodados.ibge.gov.br/api/v3/noticias";
const newsList = document.getElementById('news-list');
const paginationContainer = document.getElementById('pagination');

function openFilters() {
    document.getElementById('filter-dialog').showModal();
}

function closeFilters() {
    document.getElementById('filter-dialog').close();
}

function applyFilters() {
    const form = document.getElementById('filter-form');
    const formData = new FormData(form);
    const queryString = new URLSearchParams(formData).toString();
    window.location.search = queryString;
}

function updateFiltersFromQuery() {
    const params = new URLSearchParams(window.location.search);
    document.getElementById('filter-count').textContent = Array.from(params.keys()).filter(key => key !== 'page' && key !== 'busca').length;
    if (params.has('q')) {
        document.querySelector('.search-input').value = params.get('q');
    }
    if (params.has('tipo')) {
        document.getElementById('tipo').value = params.get('tipo');
    }
    if (params.has('quantidade')) {
        document.getElementById('quantidade').value = params.get('quantidade');
    }
    if (params.has('de')) {
        document.getElementById('de').value = params.get('de');
    }
    if (params.has('ate')) {
        document.getElementById('ate').value = params.get('ate');
    }
    fetchNews();
}

function fetchNews() {
    const params = new URLSearchParams(window.location.search);
    let query = `${API_URL}?qtd=${params.get('quantidade') || 10}`;
    if (params.has('tipo')) query += `&editoria=${params.get('tipo')}`;
    if (params.has('de')) query += `&dataInicio=${params.get('de')}`;
    if (params.has('ate')) query += `&dataFim=${params.get('ate')}`;
    if (params.has('page')) query += `&pagina=${params.get('page')}`;

    fetch(query)
        .then(response => response.json())
        .then(data => { 
            displayNews(data.items);
            setupPagination(data.totalPages, parseInt(params.get('page') || 1));
        })
        .catch(error => console.error('Erro ao buscar notícias:', error));
}

function displayNews(news) {
    const newsList = document.getElementById('newsList');
    if (!newsList) {
        console.error('Elemento com ID "newsList" não encontrado.');
        return;
    }
    newsList.innerHTML = '';

    news.forEach(item => {
        const listItem = document.createElement('li');
        let imageUrl = '';

        if (item.imagens) {
            try {
                const imageObj = JSON.parse(item.imagens);
                imageUrl = "https://agenciadenoticias.ibge.gov.br/" + imageObj.image_intro;
                console.log('Imagem URL:', imageUrl);
            } catch (e) {
                console.error('Erro ao fazer parse da imagem:', e);
                console.log('Conteúdo da imagem:', item.imagens);
            }
        }
        const publishedDate = new Date(item.data_publicacao);
        
        listItem.innerHTML = `
            <img src="${imageUrl}" alt="${item.titulo}">
            <h2>${item.titulo}</h2>
            <p>${item.introducao}</p>
            <p>#${item.editoria}</p>
            <p>${timeAgo(publishedDate)}</p>
            <a href="https://agenciadenoticias.ibge.gov.br/${item.id}" target="_blank">Leia Mais</a>
        `;
        newsList.appendChild(listItem);
    });
}

function setupPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = '';
    let startPage = Math.max(1, currentPage - 5);
    let endPage = Math.min(totalPages, currentPage + 4);

    if (currentPage > 5) {
        const firstPageButton = createPageButton(1);
        paginationContainer.appendChild(firstPageButton);
        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i, i === currentPage);
        paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages - 4) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.textContent = '...';
            paginationContainer.appendChild(ellipsis);
        }
        const lastPageButton = createPageButton(totalPages);
        paginationContainer.appendChild(lastPageButton);
    }
}

function createPageButton(page, isCurrent) {
    const pageButton = document.createElement('button');
    pageButton.textContent = page;
    pageButton.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', page);
        window.location.search = params.toString();
    });

    if (isCurrent) {
        pageButton.classList.add('current-page');
    }

    const listItem = document.createElement('li');
    listItem.appendChild(pageButton);
    return listItem;
}

function timeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Publicado hoje';
    if (diffInDays === 1) return 'Publicado ontem';
    return `Publicado há ${diffInDays} dias`;
}

function loadNewsTypes() {
    const editorias = ["Censo", "Economia", "Educação", "Saúde", "Meio Ambiente"];
    const tipoSelect = document.getElementById('tipo');
    editorias.forEach(editoria => {
        const option = document.createElement('option');
        option.value = editoria;
        option.textContent = editoria;
        tipoSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateFiltersFromQuery();
    loadNewsTypes();
});
