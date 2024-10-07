
    function performSearch() {
        var input = document.getElementById('searchInput').value.toLowerCase();
        var files = document.getElementsByClassName('file-item');
        for (var i = 0; i < files.length; i++) {
            var title = files[i].getElementsByTagName('h2')[0].textContent.toLowerCase();
            var content = files[i].getElementsByTagName('p')[1].textContent.toLowerCase();
            if (title.includes(input) || content.includes(input)) {
                files[i].style.display = "";
            } else {
                files[i].style.display = "none";
            }
        }
    }
    