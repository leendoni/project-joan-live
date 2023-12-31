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
		Reset,
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
		{ key: 'userID', value: 'Account ID' },
		{ key: 'userCL', value: 'Account Class' },
		{ key: 'userLN', value: 'Last Name' },
		{ key: 'userFN', value: 'First Name' },
		{ key: 'userMN', value: 'Middle Name' },
		{ key: 'userST', value: 'Activated?' }
	];

	let userRow = [];
	let userSize = 8;
	let userPage = 1;

	let selectedRowIds = []; // get toggled radio

	function resetData() {
		userID = '';
		userCL = '';
		userST = false;
		userOL = false;
		userFP = false;
		userUN = '';
		userPW = '';
		userDP = '';
		userAY = '';
		userSM = '';
		userYR = '';
		userSC = '';
		userLR = '';
		userLN = '';
		userFN = '';
		userMN = '';
		userSF = '';
		userSX = '';
		userCN = 0;
		userAD = '';
		userFA = '';
		userMA = '';
		userGA = '';
		userEC = 0;
		userCP = '';
		userCR = '';
		userPR = '';
	}

	async function getPassData() {
		// const q = query(getUsers, where('userCL', '!=', 'student'));
		const q = query(getUsers, where('userFP', '==', true));
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadPassData() {
		const data = await getPassData();
		userRow = data.map((item) => ({
			id: item.userID,
			userID: item.userID,
			userCL: item.userCL,
			userST: item.userST,
			userOL: item.userOL,
			userFP: item.userFP,
			userUN: item.userUN,
			userPW: item.userPW,
			userDP: item.userDP,
			userAY: item.userAY,
			userSM: item.userSM,
			userYR: item.userYR,
			userSC: item.userSC,
			userLR: item.userLR,
			userLN: item.userLN,
			userFN: item.userFN,
			userMN: item.userMN,
			userSF: item.userSF,
			userSX: item.userSX,
			userCN: item.userCN,
			userAD: item.userAD,
			userFA: item.userFA,
			userMA: item.userMA,
			userGA: item.userGA,
			userEC: item.userEC,
			userCP: item.userCP,
			userCR: item.userCR,
			userPR: item.userPR
		}));
	}

	async function getUserData() {
		// const q = query(getUsers, where('userCL', '!=', 'student'));
		const q = query(getUsers, where('userCL', '==', 'student'));
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadUserData() {
		const data = await getUserData();
		userRow = data.map((item) => ({
			id: item.userID,
			userID: item.userID,
			userCL: item.userCL,
			userST: item.userST,
			userOL: item.userOL,
			userFP: item.userFP,
			userUN: item.userUN,
			userPW: item.userPW,
			userDP: item.userDP,
			userAY: item.userAY,
			userSM: item.userSM,
			userYR: item.userYR,
			userSC: item.userSC,
			userLR: item.userLR,
			userLN: item.userLN,
			userFN: item.userFN,
			userMN: item.userMN,
			userSF: item.userSF,
			userSX: item.userSX,
			userCN: item.userCN,
			userAD: item.userAD,
			userFA: item.userFA,
			userMA: item.userMA,
			userGA: item.userGA,
			userEC: item.userEC,
			userCP: item.userCP,
			userCR: item.userCR,
			userPR: item.userPR
		}));
	}

	async function getEmployeeData() {
		// const q = query(getUsers, where('userCL', '!=', 'student'));
		const q = query(getUsers, where('userCL', 'not-in', ['god', 'student']));
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadEmployeeData() {
		const data = await getEmployeeData();
		userRow = data.map((item) => ({
			id: item.userID,
			userID: item.userID,
			userCL: item.userCL,
			userST: item.userST,
			userOL: item.userOL,
			userFP: item.userFP,
			userUN: item.userUN,
			userPW: item.userPW,
			userDP: item.userDP,
			userAY: item.userAY,
			userSM: item.userSM,
			userYR: item.userYR,
			userSC: item.userSC,
			userLR: item.userLR,
			userLN: item.userLN,
			userFN: item.userFN,
			userMN: item.userMN,
			userSF: item.userSF,
			userSX: item.userSX,
			userCN: item.userCN,
			userAD: item.userAD,
			userFA: item.userFA,
			userMA: item.userMA,
			userGA: item.userGA,
			userEC: item.userEC,
			userCP: item.userCP,
			userCR: item.userCR,
			userPR: item.userPR
		}));
	}

	async function fetchSelected(referenceCode) {
		const q = query(getUsers, where('userID', '==', referenceCode));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			// No records found for the provided reference code
			console.log('fetchSelected: Empty records.');
			return null;
		}

		return snapshot.docs[0].data();
	}

	async function handleSelected() {
		const data = await fetchSelected(selectedRowIds.toString()); // convert to string or it wont load

		if (data) {
			userID = data.userID;
			userCL = data.userCL;
			userST = data.userST;
			userOL = data.userOL;
			userFP = data.userFP;
			userUN = data.userUN;
			userPW = data.userPW;
			userDP = data.userDP;
			userAY = data.userAY;
			userSM = data.userSM;
			userYR = data.userYR;
			userSC = data.userSC;
			userLR = data.userLR;
			userLN = data.userLN;
			userFN = data.userFN;
			userMN = data.userMN;
			userSF = data.userSF;
			userSX = data.userSX;
			userCN = data.userCN;
			userAD = data.userAD;
			userFA = data.userFA;
			userMA = data.userMA;
			userGA = data.userGA;
			userEC = data.userEC;
			userCP = data.userCP;
			userCR = data.userCR;
			userPR = data.userPR;
		} else {
			resetData();
		}

		console.log(userID);
		console.log(userCL);
	}

	async function updateSelected() {
		const updatedData = {
			userID: userID,
			userCL: userCL,
			userST: userST,
			userOL: userOL,
			userFP: userFP,
			userUN: userUN,
			userPW: userPW,
			userDP: userDP,
			userAY: userAY,
			userSM: userSM,
			userYR: userYR,
			userSC: userSC,
			userLR: userLR,
			userLN: userLN,
			userFN: userFN,
			userMN: userMN,
			userSF: userSF,
			userSX: userSX,
			userCN: userCN,
			userAD: userAD,
			userFA: userFA,
			userMA: userMA,
			userGA: userGA,
			userEC: userEC,
			userCP: userCP,
			userCR: userCR,
			userPR: userPR
		};

		const q = query(getUsers, where('userID', '==', selectedRowIds.toString()));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			console.error('No records found for the selected reference code.');
			return;
		}

		const docId = snapshot.docs[0].id;
		const docRef = doc(db, schlID, 'data', 'users', docId);

		try {
			await updateDoc(docRef, updatedData);
			console.log('Successfully updated');
			loadEmployeeData();
			resetData();
			edit = false;
		} catch (error) {
			edit = false;
			console.error('Error updating document:', error);
		}
	}

	function makeUserUN() {
		const trimLR = userLR.slice(-6); // Get the last 6 characters of the LRN
		userUN = `${userLN}.${trimLR}@csjd.project-joan.cloud`;
	}

	async function makeUserPW() {
		userPW = userUN.slice(0, -24);
		const salt = await bcrypt.genSalt(10); // Generate a salt
		const hashedPassword = await bcrypt.hash(userPW, salt); // Hash the password
		return hashedPassword;
	}

	async function resetPass() {
		userFP = false;
		userPW = 'csjd.reset123';

		const salt = await bcrypt.genSalt(10); // Generate a salt
		const pass = await bcrypt.hash(userPW, salt); // Hash the password

		const updatedData = {
			userFP: userFP,
			userPW: pass
		};

		const q = query(getUsers, where('userID', '==', selectedRowIds.toString()));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			console.error('No records found for the selected reference code.');
			return;
		}

		const docId = snapshot.docs[0].id;
		const docRef = doc(db, schlID, 'data', 'users', docId);

		try {
			await updateDoc(docRef, updatedData);
			console.log('Password reset.');
			loadUserData();
			edit = false;
		} catch (error) {
			edit = false;
			console.error('Error updating document:', error);
		}
	}

	function makeUserID() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		let result = '';
		for (let i = 0; i < 8; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}

		userID = result;
	}

	async function checkUserLR(value) {
		const getUsers = collection(db, schlID, 'data', 'users');
		const q = query(getUsers, where('userLR', '==', value));
		const snapshot = await getDocs(q);
		return !snapshot.empty; // Returns true if the entry exists
	}

	async function registerUser(event) {
		let duplLR = await checkUserLR(userLR);

		event.preventDefault();

		// Construct the data object
		const userData = {
			userID,
			userCL,
			userST,
			userOL,
			userFP,
			userUN,
			userPW,
			userDP,
			userAY,
			userSM,
			userYR,
			userSC,
			userLR,
			userLN,
			userFN,
			userMN,
			userSF,
			userSX,
			userCN,
			userAD,
			userFA,
			userMA,
			userGA,
			userEC,
			userCP,
			userCR,
			userPR
		};

		// check duplicates
		if (duplLR) {
			return; // Don't proceed with saving the data if there are duplicates
		} else {
			try {
				await uploadUser(userData);
				resetData();
                loadEmployeeData();
                !add;
			} catch (e) {
				console.log('Failed to save data. Please try again.');
			}
		}
	}

	async function uploadUser(data) {
		try {
			const docRef = await addDoc(collection(db, schlID, 'data', 'users'), data);
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
	});
</script>

<Header company="Project" platformName="JOAN" href="/">
	<div class="text-white hidden lg:flex">User Management</div>
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
			<SideNavLink isSelected href="/administrator/users" text="User Management" />
			<SideNavLink href="/administrator/sections" text="Section Management" />
			<SideNavLink href="/administrator/subjects" text="Subject Management" />
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
	<div class="flex flex-col">
		<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
			<h6 class="text-white">User Masterlist</h6>
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
	<div class="flex flex-col bg-white">
		<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
			<h6 class="text-white">User Information</h6>
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
						if (userID != '') edit = true;
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
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Personal Information</p>
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				{#if userCL === 'student'}
					<div class="flex flex-col gap-4">
						<TextInput
							bind:value={userLR}
							labelText="Learner's Reference Number"
							placeholder="Your Learner's Reference Number"
							readonly={!edit}
						/>
					</div>
				{:else}
					<div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
						<ComboBox
							titleText="Type of Government ID"
							placeholder="Select ID type"
							items={[
								{ id: '0', text: 'Professional Regulatory Commission (PRC License)' },
								{ id: '1', text: 'Land Transportation Office (Drivers License)' },
								{ id: '2', text: 'Philippine Identification System (National ID)' },
								{ id: '3', text: 'Philippine Health Insurance Corp. (PhilHealth)' },
								{ id: '4', text: 'Philippine Passport' }
							]}
							disabled={!edit}
						/>
						<TextInput
							bind:value={userLR}
							labelText="Government ID Number"
							placeholder="Your government ID number"
							readonly={!edit}
						/>
					</div>
				{/if}
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInput
						bind:value={userLN}
						labelText="Last Name"
						placeholder="Your last name"
						readonly={!edit}
					/>
					<TextInput
						bind:value={userFN}
						labelText="First Name"
						placeholder="Your first name"
						readonly={!edit}
					/>
					<TextInput
						bind:value={userMN}
						labelText="Middle Name"
						placeholder="Your middle name"
						readonly={!edit}
					/>
					<TextInput
						bind:value={userSF}
						labelText="Suffix"
						placeholder="Sr., Jr., III., etc."
						readonly={!edit}
					/>
				</div>
				<div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
					<ComboBox
						bind:value={userSX}
						titleText="Gender"
						placeholder="Select gender"
						items={[
							{ id: '0', text: 'Male' },
							{ id: '1', text: 'Female' }
						]}
						disabled={!edit}
					/>
					<TextInput
						bind:value={userCN}
						labelText="Contact Number"
						placeholder="9876543210"
						type="number"
						readonly={!edit}
					/>
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInput
						bind:value={userAD}
						labelText="Address"
						placeholder="Your address"
						readonly={!edit}
					/>
				</div>
				{#if userCL === 'student'}
					<div class="flex flex-col lg:flex-row gap-4">
						<TextInput
							bind:value={userFA}
							labelText="Father's Name"
							placeholder="Your father's name"
							readonly={!edit}
						/>
						<TextInput
							bind:value={userMA}
							labelText="Mother's Name"
							placeholder="Your mother's name"
							readonly={!edit}
						/>
						<TextInput
							bind:value={userGA}
							labelText="Guardian's Name"
							placeholder="Your guardian's name"
							readonly={!edit}
						/>
					</div>
				{/if}
				<div class="flex flex-col lg:grid lg:grid-cols-3 gap-4">
					<TextInput
						bind:value={userEC}
						labelText="Emergency Contact Number"
						placeholder="9876543210"
						type="number"
						readonly={!edit}
					/>
					<TextInput
						bind:value={userCP}
						labelText="Emergency Contact Person"
						placeholder="Your emergency contact person"
						readonly={!edit}
					/>
					<TextInput
						bind:value={userCR}
						labelText="Emergency Contact Relation"
						placeholder="Your emergency contact relation"
						readonly={!edit}
					/>
				</div>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Account Information</p>
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<Toggle
						bind:toggled={userST}
						labelText="Account Status"
						labelA="Account Inactive"
						labelB="Account Active"
						disabled={!edit}
					/>
					<TextInput
						bind:value={userID}
						labelText="Account ID"
						placeholder="System-generated ID"
						readonly
					/>
					<ComboBox
						bind:value={userCL}
						on:select={makeUserID}
						on:select={makeUserUN}
						on:select={makeUserPW}
						titleText="User Class"
						placeholder="Select user class"
						items={[
							{ id: '0', text: 'administrator' },
							{ id: '1', text: 'admission' },
							{ id: '2', text: 'cashier' },
							{ id: '3', text: 'faculty' },
							{ id: '4', text: 'guidance' },
							{ id: '5', text: 'librarian' },
							{ id: '6', text: 'nurse' }
						]}
					/>
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInput
						bind:value={userUN}
						labelText="Username"
						placeholder="System-generated username"
						readonly
					/>
					<PasswordInput
						bind:value={userPW}
						labelText="Password"
						placeholder="System-generated password"
						readonly
					/>
					<Button on:click={resetPass} disabled={!userFP} icon={Reset}>Reset Password</Button>
				</div>
			</div>
		</Content>
	</div>
</div>
