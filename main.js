const { app, Menu, MenuItem, Tray, dialog } = require('electron')
const Store = require('electron-store')
const spawn = require('cross-spawn')
const { resolve, basename } = require('path')

const schema = {
	projects: {
		type: 'string',
		default: ''
	},
};

const store = new Store({ schema });
// store.clear()
app.on('ready', () => {
	const tray = new Tray(resolve(__dirname, 'asserts', 'icon.png'))
	const storedProjects = store.get('projects')
	const projects = storedProjects ? JSON.parse(storedProjects) : []

	// Adicionando os projetos já cadastrados no menu
	const items = projects.map((project) => {
		return { label: project.name, type: 'normal', click: () => open_project([project.path]) }
	});

	const contextMenu = Menu.buildFromTemplate([
		...items,
		{ type: 'separator' },
		{
			label: 'Add Project',
			click: () => {
				const [path] = dialog.showOpenDialog({ properties: ['openDirectory'] });

				store.set('projects', JSON.stringify([...projects, {
					path,
					name: basename(path)
				}]));

				contextMenu.append(new MenuItem({ label: basename(path), click: () => open_project([path])}))
			}
		}
	])

	tray.setContextMenu(contextMenu)

})

function open_project(path){
	spawn('code', [path])
}

// function clicou(){

//     prompt({
//         title: 'Rastreamento do correios',
//         label: 'Código:',
//         value: '',
//         inputAttrs: {
//             type: 'text'
//         }
//     })
//     .then((r) => {
//         if(r === null) {
//             console.log('user cancelled');
//         } else {
//             console.log('result', r);
//             let text = robot(code)
//             dialog.showMessageBox(null, 
//                     {title: 'Infomações',
//                     buttons: ['OK'],
//                     message: text}
//             )

//         }
//     })
//     .catch(console.error);
// }
