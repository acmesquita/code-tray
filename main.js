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

let mainTray = null
// store.clear()

function render(tray = mainTray){
	const storedProjects = store.get('projects')
	const projects = storedProjects ? JSON.parse(storedProjects) : []

	// Adicionando os projetos já cadastrados no menu
	const items = projects.map((project) => ({
		label: project.name,
		submenu:[
			{
				label: 'Abrir no VSCode',
				click: () => {
					open_project([project.path])
				},
			},
			{
				label: 'Remove',
				click: () => {
					store.set('projects', JSON.stringify(projects.filter(item => item.path !== project.path)));

					render();
				}
			}
		]
	}));

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Add Project',
			click: () => {
				const result = dialog.showOpenDialog({ properties: ['openDirectory'] });

				if (!result) return 
				const [path] = result
				const name = basename(path)

				store.set('projects', JSON.stringify([...projects, {
					path,
					name
				}]));

				render();
			}
		},
		{ type: 'separator' },
		...items,
		{
			label: 'Fechar Code Tray',
			type: 'normal',
			role:'quit',
			enabled: true
		}
	])

	tray.setContextMenu(contextMenu)
}

app.on('ready', () => {
	mainTray = new Tray(resolve(__dirname, 'asserts', 'icon.png'))

	render(mainTray)
})

function open_project([path]){
	spawn('code', [path], {
		cwd: process.cwd(),
		env: {
			PATH: process.env.PATH,
		},
		stdio: 'inherit',
	});
}
