<script>
	// #region imports
	// svelte
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	// components
	import {
		Button,
		ClickableTile,
		ComboBox,
		Content,
		DataTable,
		Header,
		HeaderUtilities,
		Pagination,
		PasswordInput,
		SideNav,
		SideNavDivider,
		SideNavItems,
		SideNavLink,
		SideNavMenu,
		TextInput,
		Tile,
		Toggle,
		Toolbar,
		ToolbarContent,
		ToolbarMenu,
		ToolbarMenuItem,
		ToolbarSearch
	} from 'carbon-components-svelte';
	// icons
	import {
		AddAlt,
		Box,
		ContainerSoftware,
		Dashboard,
		Debug,
		Edit,
		Education,
		EventSchedule,
		Filter,
		Information,
		Logout,
		Money,
		Printer,
		Recycle,
		Report,
		Save,
		Settings,
		SettingsAdjust,
		TrashCan,
		Upload,
		UserAvatarFilledAlt
	} from 'carbon-icons-svelte';
	// pictograms
	// firebase
	import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
	import { db } from '../../../firebase';
	// for password hashing
	import bcrypt from 'bcryptjs';
	// #endregion
	// #region database values
	let pageID = '/administrator/users';
	let dbConn = false;
	// schoolyear data
	let schlID = '0303001',
		systST = false,
		mdulID = '',
		mdulST = false,
		acadAY = '2023-2024',
		acadSD = '',
		acadND = '',
		acadSM = '',
		acadQT = '';
	// database values
	const getUsers = collection(db, schlID, 'data', 'users');
	// user data
	let userID = '',
		userCL = '',
		userST = false,
		userOL = false,
		userFP = false,
		userUN = '',
		userPW = '',
		userDP = '',
		userAY = '',
		userSM = '',
		userYR = '',
		userSC = '',
		userLR = '',
		userLN = '',
		userFN = '',
		userMN = '',
		userSF = '',
		userSX = '',
		userCN = 0,
		userAD = '',
		userFA = '',
		userMA = '',
		userGA = '',
		userEC = 0,
		userCP = '',
		userCR = '',
		userPR = '';

	let loclCL = '',
		loclFN = '',
		loclID = '',
		loclNM = '',
		loclTM = 'g10';

	let probAY = '2023-2024',
		probID = '',
		probNM = '',
		probDC = '',
		probST = '',
		probBY = '';

	let sectAY = '',
		sectID = '',
		sectCL = '',
		sectNM = '',
		sectYR = '',
		sectAV = '',
		sectML = '',
		sectFL = '';
	// #endregion
	// #region functional variables
	// sidebar
	let sideBR = false;
	// password
	let editAC = false;
	// modals
	let reportBugMD00 = false, // open
		reportBugMD01 = false, // default
		reportBugMD02 = false; // success
	let accountSTMD00 = false, // open
		accountSTMD01 = false, // default
		accountSTMD02 = false; // success
	// #endregion
	// #region functions
	// #region general
	// change theme
	function toggleDark() {
		if (loclTM == 'white') {
			loclTM = 'g100';
			document.documentElement.setAttribute('theme', loclTM);
			localStorage.setItem('loclTM', loclTM);
		} else {
			loclTM = 'g10';
			document.documentElement.setAttribute('theme', loclTM);
			localStorage.setItem('loclTM', loclTM);
		}
	}

	function goLogin() {
		goto('/login');
	}

	function goHome() {
		goto('/home');
	}

	function handleLogout() {
		localStorage.removeItem('userID');
		localStorage.removeItem('userCL');
		goto('/login');
	}
	// #endregion
	// #region for database
	function makeProbID() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		probID = result;
	}

	async function reportProb(event) {
		if (probID === '' || probNM === '' || probDC === '') {
			return;
		}

		try {
			const reportData = {
				probAY,
				probID,
				probNM,
				probDC,
				probST: 'unsolved',
				probBY: loclID
			};

			await addDoc(collection(db, 'bugs'), reportData);
		} catch (e) {
			console.log(e);
			console.log('Failed to save data. Please try again.');
		}
	}
	// #endregion
	// #endregion
	// #region page logic
	let edit = false;
	let add = false;

	let userHeader = [
		{ key: 'sectID', value: 'Section ID' },
		{ key: 'sectYR', value: 'Section Year' },
		{ key: 'sectNM', value: 'Section Name' },
		{ key: 'sectAY', value: 'Academic Year' }
	];

	let userRow = [];
	let userSize = 8;
	let userPage = 1;

	let selectedRowIds = []; // get toggled radio

	function resetData() {
		sectAY = '';
		sectID = '';
		sectCL = '';
		sectNM = '';
		sectYR = '';
		sectAV = '';
		sectML = '';
		sectFL = '';
	}

	function makeSectID() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		let result = '';
		for (let i = 0; i < 8; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}

		sectID = result;
	}

	async function getEmployeeData() {
		// const q = query(getUsers, where('userCL', '!=', 'student'));
		const getUsers = collection(db, schlID, 'data', 'sections');
		const q = query(getUsers);
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadEmployeeData() {
		const data = await getEmployeeData();
		userRow = data.map((item) => ({
			id: item.sectID,
			sectAY: item.sectAY,
			sectID: item.sectID,
			sectCL: item.sectCL,
			sectNM: item.sectNM,
			sectYR: item.sectYR,
			sectAV: item.sectAV,
			sectML: item.sectML,
			sectFL: item.sectFL
		}));
	}

	async function fetchSelected(referenceCode) {
		const getUsers = collection(db, schlID, 'data', 'sections');
		const q = query(getUsers, where('sectID', '==', referenceCode));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			// No records found for the provided reference code
			console.log('fetchSelected: Empty records.');
			return null;
		}

		return snapshot.docs[0].data();
	}

	let facultyList = [];

	async function fetchFaculty() {
		const q = query(getUsers, where('userCL', '==', 'faculty'));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			// No records found for the provided reference code
			console.log('fetchSelected: Empty records.');
			return null;
		}

		facultyList = snapshot.docs.map((doc) => {
			const userData = doc.data();
			return {
				id: userData.userID,
				text: `${userData.userLN}, ${userData.userFN} ${userData.userMN}`
			};
		});
	}

	let subjectList = [];

	async function fetchSubjects() {
		const getUsers = collection(db, schlID, 'data', 'subjects');
		const q = query(getUsers);
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			// No records found for the provided reference code
			console.log('fetchSelected: Empty records.');
			return null;
		}

		subjectList = snapshot.docs.map((doc) => {
			const userData = doc.data();
			return {
				id: userData.subjID,
				text: userData.subjNM
			};
		});
	}

	async function handleSelected() {
		const data = await fetchSelected(selectedRowIds.toString()); // convert to string or it wont load

		if (data) {
			sectAY = data.sectAY;
			sectID = data.sectID;
			sectCL = data.sectCL;
			sectNM = data.sectNM;
			sectYR = data.sectYR;
			sectAV = data.sectAV;
			sectML = data.sectML;
			sectFL = data.sectFL;
		} else {
			resetData();
		}
	}

	async function updateSelected() {
		const updatedData = {
			sectAY: sectAY,
			sectID: sectID,
			sectCL: sectCL,
			sectNM: sectNM,
			sectYR: sectYR,
			sectAV: userID,
			sectML: sectML,
			sectFL: sectFL
		};

		const getUsers = collection(db, schlID, 'data', 'sections');
		const q = query(getUsers, where('sectID', '==', selectedRowIds.toString()));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			console.error('No records found for the selected reference code.');
			return;
		}

		const docId = snapshot.docs[0].id;
		const docRef = doc(db, schlID, 'data', 'sections', docId);

		try {
			await updateDoc(docRef, updatedData);
			console.log('Successfully updated');
			loadEmployeeData();
			resetData();
			!edit;
			!add;
		} catch (error) {
			edit = false;
			console.error('Error updating document:', error);
		}
	}

	async function checkUserLR(value) {
		const getUsers = collection(db, schlID, 'data', 'sections');
		const q = query(getUsers, where('userLR', '==', value));
		const snapshot = await getDocs(q);
		return !snapshot.empty; // Returns true if the entry exists
	}

	async function registerUser(event) {
		console.log(userID);
		makeSectID();

		let duplLR = await checkUserLR(userLR);

		event.preventDefault();

		// Construct the data object
		const userData = {
			sectAY,
			sectID,
			sectCL,
			sectNM,
			sectYR,
			sectAV,
			sectML,
			sectFL
		};

		// check duplicates
		if (duplLR) {
			return; // Don't proceed with saving the data if there are duplicates
		} else {
			try {
				await uploadUser(userData);
				resetData();
				loadEmployeeData();
				fetchFaculty();
			} catch (e) {
				console.log('Failed to save data. Please try again.');
			}
		}
	}

	async function uploadUser(data) {
		try {
			const docRef = await addDoc(collection(db, schlID, 'data', 'sections'), data);
			console.log('Document written with ID: ', docRef.id);
			return docRef.id; // you can return the ID to further use it if needed
		} catch (e) {
			console.error('Error adding document: ', e);
			throw e; // re-throwing the error for the caller to handle
		}
	}

	let subjA, subjB, subjC, subjD, subjE, subjF, subjG, subjH, subjI, subjJ, subjK, subjL;

	// #endregion
	onMount(async () => {
		try {
			await getDocs(getUsers);
			console.log('Connected.');

			dbConn = true;

			loclID = localStorage.getItem('userID');
			loclCL = localStorage.getItem('userCL');
			loclFN = localStorage.getItem('userFN');
		} catch (error) {
			console.error('Failed. :', error);
			dbConn = false;
		}

		loadEmployeeData();
		fetchSubjects();
	});
</script>

<Header company="Project" platformName="JOAN" href="/">
	<div class="text-white hidden lg:flex">Schedule Management</div>
	<HeaderUtilities>
		<Button icon={Debug} iconDescription="Report a bug" tooltipPosition="left" kind="ghost" />
		<Button
			icon={UserAvatarFilledAlt}
			iconDescription="Account Settings"
			tooltipPosition="left"
			kind="secondary"
		/>
		<Button icon={Logout} iconDescription="Logout" tooltipPosition="left" kind="danger" />
	</HeaderUtilities>
</Header>

<SideNav rail>
	<SideNavItems>
		<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
		<SideNavDivider />
		<SideNavLink icon={Debug} href="/bugs" text="Reported Bugs" />
		<SideNavDivider />
		<SideNavMenu icon={SettingsAdjust} text="Management Modules" expanded>
			<SideNavLink href="/administrator/users" text="User Management" />
			<SideNavLink href="/administrator/sections" text="Section Management" />
			<SideNavLink href="/administrator/subjects" text="Subject Management" />
			<SideNavLink isSelected href="/administrator/schedules" text="Schedule Management" />
			<SideNavLink href="/administrator/bulletin" text="Bulletin Management" />
		</SideNavMenu>
		<SideNavMenu icon={Education} text="Academic Modules">
			<SideNavLink href="/academic/admission" text="Admissions" />
			<SideNavLink href="/academic/enrollment" text="Enrollments" />
			<SideNavLink href="/academic/sections" text="Sections" />
			<SideNavLink href="/academic/subjects" text="Subjects" />
			<SideNavLink href="/academic/gradebook" text="Gradebook" />
			<hr />
			<SideNavLink href="/guidance/records" text="Guidance Records" />
			<SideNavLink href="/guidance/defaults" text="Guidance Settings" />
		</SideNavMenu>
		<SideNavMenu icon={Money} text="Financial Modules">
			<SideNavLink href="/finance/transact" text="Financial Transactions" />
			<SideNavLink href="/finance/defaults" text="Financial Settings" />
		</SideNavMenu>
		<SideNavMenu icon={ContainerSoftware} text="Miscellaneous Modules">
			<SideNavLink href="/library" text="Library Management" />
			<SideNavLink href="/health" text="Health Records" />
		</SideNavMenu>
		<SideNavDivider />
		<SideNavLink icon={Information} href="/system/about" text="System Information" />
		<SideNavLink icon={Report} href="/system/reports" text="System Reports" />
		<SideNavLink icon={Settings} href="/system/defaults" text="System Settings" />
		<SideNavDivider />
		<SideNavMenu icon={Box} text="Archives">
			<SideNavLink href="/archives/system" text="System Archives" />
			<SideNavLink href="/archives/student" text="Student Archives" />
			<SideNavLink href="/archives/employee" text="Employee Archives" />
		</SideNavMenu>
		<SideNavDivider />
		<SideNavLink icon={EventSchedule} href="/student/schedules" text="Class Schedules" />
	</SideNavItems>
</SideNav>

<div class="flex flex-col pt-16 pl-16 pr-4 w-full gap-4">
	<div class="flex flex-col w-full">
		<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
			<h6 class="text-white">Section Masterlist</h6>
		</div>
		<Tile class="h-auto">
			<DataTable
				bind:selectedRowIds
				on:click:row--select={handleSelected}
				on:click:row--select={() => (edit = false)}
				on:click:row--select={() => (add = false)}
				radio
				zebra
				sortable
				size="short"
				headers={userHeader}
				rows={userRow}
				page={userPage}
				pageSize={userSize}
			>
				<Toolbar>
					<ToolbarContent>
						<ToolbarSearch shouldFilterRows />
						<Button
							on:click={loadEmployeeData}
							kind="ghost"
							icon={Recycle}
							iconDescription="Reload"
							tooltipPosition="left"
						/>
						<ToolbarMenu icon={Filter} iconDescription="Filter">
							<ToolbarMenuItem on:click={loadPassData}>Forgot Password</ToolbarMenuItem>
							<ToolbarMenuItem on:click={loadUserData}>Students Only</ToolbarMenuItem>
							<ToolbarMenuItem on:click={loadEmployeeData}>Employees Only</ToolbarMenuItem>
						</ToolbarMenu>
					</ToolbarContent>
				</Toolbar>
			</DataTable>
			<Pagination
				bind:pageSize={userSize}
				bind:page={userPage}
				totalItems={userRow.length}
				pageSizeInputDisabled
			/>
		</Tile>
	</div>
	<div class="flex flex-col bg-white w-full">
		<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
			<h6 class="text-white">Schedule Creation</h6>
			<div class="flex">
				<Button
					on:click={() => (add = true)}
					on:click={() => (edit = true)}
					disabled={add}
					kind="secondary"
					size="small"
					icon={AddAlt}
					iconDescription="Create New"
					tooltipPosition="left"
				/>
				<Button
					on:click={registerUser}
					disabled={!add}
					kind="secondary"
					size="small"
					icon={Upload}
					iconDescription="Create New"
					tooltipPosition="left"
				/>
				<Button
					on:click={() => {
						if (sectID != '') edit = true;
					}}
					disabled={edit}
					size="small"
					kind="primary"
					icon={Edit}
					iconDescription="Edit Selected"
					tooltipPosition="left"
				/>
				<Button
					on:click={updateSelected}
					disabled={!edit}
					size="small"
					kind="primary"
					icon={Save}
					iconDescription="Save Changes"
					tooltipPosition="left"
				/>
			</div>
		</div>
		<Content class="flex flex-col">
			<div class="flex flex-col lg:flex-row w-full gap-4">
				<TextInput
					bind:value={sectNM}
					labelText="Section Name"
					placeholder="Name of Section"
					readonly={!edit}
				/>
				<TextInput
					bind:value={sectYR}
					labelText="Section Year"
					placeholder="Year / Grade Level"
					readonly={!edit}
				/>
				<TextInput
					bind:value={sectAV}
					labelText="Adviser"
					placeholder="Name of Adviser"
					readonly={!edit}
				/>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Major Subjects</p>
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<ComboBox
						bind:value={subjA}
						titleText="Major Subject A"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjB}
						titleText="Major Subject B"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjC}
						titleText="Major Subject C"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjD}
						titleText="Major Subject D"
						placeholder="Select subject"
						items={subjectList}
					/>
				</div>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Minor Subjects</p>
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<ComboBox
						bind:value={subjE}
						titleText="Subject E"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjF}
						titleText="Subject F"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjG}
						titleText="Subject G"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjH}
						titleText="Subject H"
						placeholder="Select subject"
						items={subjectList}
					/>
				</div>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Other Subjects</p>
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<ComboBox
						bind:value={subjI}
						titleText="Subject I"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjJ}
						titleText="Subject J"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjK}
						titleText="Subject K"
						placeholder="Select subject"
						items={subjectList}
					/>
					<ComboBox
						bind:value={subjL}
						titleText="Subject L"
						placeholder="Select subject"
						items={subjectList}
					/>
				</div>
			</div>
		</Content>
		<Content id="export-content" class="grid grid-cols-6 grid-flow-row w-full gap-2">
			<div />
			<div>
				<h5>Monday</h5>
			</div>
			<div>
				<h5>Tuesday</h5>
			</div>
			<div>
				<h5>Wednesday</h5>
			</div>
			<div>
				<h5>Thursday</h5>
			</div>
			<div>
				<h5>Friday</h5>
			</div>

			<div>
				<h5>06:45-07:15</h5>
			</div>
			<div />
			<div />
			<div />
			<div />
			<div />

			<div>
				<h5>07:15-08:00</h5>
			</div>
			<div />
			<div />
			<div />
			<div />
			<div />

			<div>
				<h5>08:00-08:45</h5>
			</div>
			<div>
				<p>{subjA}</p>
			</div>
			<div>
				<p>{subjH}</p>
			</div>
			<div>
				<p>{subjG}</p>
			</div>
			<div>
				<p>{subjJ}</p>
			</div>
			<div>
				<p>{subjI}</p>
			</div>

			<div>
				<h5>08:45-09:30</h5>
			</div>
			<div>
				<p>{subjB}</p>
			</div>
			<div>
				<p>{subjA}</p>
			</div>
			<div>
				<p>{subjH}</p>
			</div>
			<div>
				<p>{subjK}</p>
			</div>
			<div>
				<p>{subjJ}</p>
			</div>

			<div>
				<h5>09:30-10:00</h5>
			</div>
			<div class="col-span-5 place-self-center">
				<p>Health Break</p>
			</div>

			<div>
				<h5>10:00-10:45</h5>
			</div>
			<div>
				<p>{subjC}</p>
			</div>
			<div>
				<p>{subjB}</p>
			</div>
			<div>
				<p>{subjA}</p>
			</div>
			<div>
				<p>{subjL}</p>
			</div>
			<div>
				<p>{subjK}</p>
			</div>

			<div>
				<h5>10:45-11:30</h5>
			</div>
			<div>
				<p>{subjD}</p>
			</div>
			<div>
				<p>{subjC}</p>
			</div>
			<div>
				<p>{subjB}</p>
			</div>
			<div>
				<p>{subjA}</p>
			</div>
			<div>
				<p>{subjL}</p>
			</div>

			<div>
				<h5>11:30-12:30</h5>
			</div>
			<div class="col-span-5 place-self-center">
				<p>Lunch Break</p>
			</div>

			<div>
				<h5>12:30-01:15</h5>
			</div>
			<div>
				<p>{subjE}</p>
			</div>
			<div>
				<p>{subjD}</p>
			</div>
			<div>
				<p>{subjC}</p>
			</div>
			<div>
				<p>{subjB}</p>
			</div>
			<div>
				<p>{subjA}</p>
			</div>

			<div>
				<h5>01:15-02:00</h5>
			</div>
			<div>
				<p>{subjF}</p>
			</div>
			<div>
				<p>{subjE}</p>
			</div>
			<div>
				<p>{subjD}</p>
			</div>
			<div>
				<p>{subjC}</p>
			</div>
			<div>
				<p>{subjB}</p>
			</div>

			<div>
				<h5>02:00-02:30</h5>
			</div>
			<div class="col-span-5 place-self-center">
				<p>Health Break</p>
			</div>

			<div>
				<h5>02:30-03:15</h5>
			</div>
			<div>
				<p>{subjG}</p>
			</div>
			<div>
				<p>{subjF}</p>
			</div>
			<div>
				<p>{subjE}</p>
			</div>
			<div>
				<p>{subjD}</p>
			</div>
			<div>
				<p>{subjC}</p>
			</div>

			<div>
				<h5>03:15-04:00</h5>
			</div>
			<div>
				<p>{subjH}</p>
			</div>
			<div>
				<p>{subjG}</p>
			</div>
			<div>
				<p>{subjF}</p>
			</div>
			<div>
				<p>{subjI}</p>
			</div>
			<div>
				<p>{subjD}</p>
			</div>

			<div>
				<h5>04:00-04:45</h5>
			</div>
			<div />
			<div />
			<div />
			<div />
			<div />

			<div>
				<h5>04:45-05:30</h5>
			</div>
			<div />
			<div />
			<div />
			<div />
			<div />
		</Content>
	</div>
</div>
