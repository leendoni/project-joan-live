<script>
	// #region imports
	// svelte
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	// components
	import {
		Button,
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

	let subjAY = '',
		subjID = '',
		subjNM = '',
		subjTC = '',
		subjND = '',
		subjMN = '';
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
		{ key: 'subjID', value: 'Subject ID' },
		{ key: 'subjNM', value: 'Subject Name' },
		{ key: 'subjTC', value: 'Subject Teacher' },
		{ key: 'subjAY', value: 'Academic Year' }
	];

	let userRow = [];
	let userSize = 8;
	let userPage = 1;

	let selectedRowIds = []; // get toggled radio

	function resetData() {
		subjAY = '';
		subjID = '';
		subjNM = '';
		subjTC = '';
		subjND = '';
		subjMN = '';
	}

	function makeSectID() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		let result = '';
		for (let i = 0; i < 8; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}

		subjID = result;
	}

	async function getEmployeeData() {
		// const q = query(getUsers, where('userCL', '!=', 'student'));
		const getUsers = collection(db, schlID, 'data', 'subjects');
		const q = query(getUsers);
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadEmployeeData() {
		const data = await getEmployeeData();
		userRow = data.map((item) => ({
			id: item.subjID,
			subjAY: item.subjAY,
			subjID: item.subjID,
			subjNM: item.subjNM,
			subjTC: item.subjTC,
			subjND: item.subjND,
			subjMN: item.subjMN
		}));
	}

	async function fetchSelected(referenceCode) {
		const getUsers = collection(db, schlID, 'data', 'subjects');
		const q = query(getUsers, where('subjID', '==', referenceCode));
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
				userID: userData.userID,
				text: `${userData.userLN}, ${userData.userFN} ${userData.userMN}`
			};
		});
	}

	async function handleSelected() {
		const data = await fetchSelected(selectedRowIds.toString()); // convert to string or it wont load

		if (data) {
			subjAY = data.subjAY;
			subjID = data.subjID;
			subjNM = data.subjNM;
			subjTC = data.subjTC;
			subjND = data.subjND;
			subjMN = data.subjMN;
		} else {
			resetData();
		}
	}

	async function updateSelected() {
		const updatedData = {
			subjAY: subjAY,
			subjID: subjID,
			subjNM: subjNM,
			subjTC: subjTC,
			subjND: subjND,
			subjMN: subjMN
		};

		const getUsers = collection(db, schlID, 'data', 'subjects');
		const q = query(getUsers, where('sectID', '==', selectedRowIds.toString()));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			console.error('No records found for the selected reference code.');
			return;
		}

		const docId = snapshot.docs[0].id;
		const docRef = doc(db, schlID, 'data', 'subjects', docId);

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
		const getUsers = collection(db, schlID, 'data', 'subjects');
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
			subjAY,
			subjID,
			subjNM,
			subjTC,
			subjND,
			subjMN
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
			const docRef = await addDoc(collection(db, schlID, 'data', 'subjects'), data);
			console.log('Document written with ID: ', docRef.id);
			return docRef.id; // you can return the ID to further use it if needed
		} catch (e) {
			console.error('Error adding document: ', e);
			throw e; // re-throwing the error for the caller to handle
		}
	}

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
		fetchFaculty();
	});
</script>

<Header company="Project" platformName="JOAN" href="/">
	<div class="text-white hidden lg:flex">Subject Management</div>
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
			<SideNavLink isSelected href="/administrator/subjects" text="Subject Management" />
			<SideNavLink href="/administrator/schedules" text="Schedule Management" />
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
			<h6 class="text-white">Subject Masterlist</h6>
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
			<h6 class="text-white">Subject Information</h6>
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
		<Content class="flex flex-col w-full gap-4">
			<div class="flex flex-col w-full gap-4">
				<div class="flex flex-col lg:grid lg:grid-cols-4 gap-4">
					<ComboBox
						bind:value={subjAY}
						titleText="Academic Year"
						placeholder="Select Academic Year"
						items={[{ id: '0', text: '2023-2024' }]}
					/>
					<TextInput
						bind:value={subjID}
						labelText="Subject ID"
						placeholder="System-generated ID"
						readonly
					/>
                    <TextInput
                        bind:value={subjNM}
                        labelText="Subject Name"
                        placeholder="Name of Subject"
                        readonly={!edit}
                    />
                    <ComboBox
                        bind:value={subjTC}
                        titleText="Subject Teacher"
                        placeholder="Select teacher"
                        items={facultyList}
                    />
				</div>
			</div>
		</Content>
	</div>
</div>
