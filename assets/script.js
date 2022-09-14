const socket = io("http://localhost:7219")

const modList = document.getElementById('mod-list')

function getOnlineMods(){
    let req = new XMLHttpRequest()
    req.open('GET', 'https://api.github.com/repos/LameGrape/StickLib/contents/mods/modlist.json')
    req.send()
    req.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            let res = JSON.parse(this.responseText)
            let modsToGet = JSON.parse(atob(res.content))

            for(let modName of Object.keys(modsToGet)){
                const modInfo = modsToGet[modName]

                let mod = document.createElement('div')
                mod.classList.add('mod')
                mod.innerHTML = "" + modList.firstElementChild.innerHTML

                console.table(modInfo)

                mod.getElementsByClassName('mod-title')[0].innerHTML = modName
                mod.getElementsByClassName('mod-description')[0].innerHTML = modInfo.description
                mod.getElementsByClassName('mod-author')[0].innerHTML = `by <a href="${modInfo.author_url}" target="_blank"> <img class="author-icon" src="${modInfo.author_icon}"> ${modInfo.author}</a>`

                console.log(mod)
                modList.appendChild(mod)
            }
        }
    }
}

getOnlineMods()
