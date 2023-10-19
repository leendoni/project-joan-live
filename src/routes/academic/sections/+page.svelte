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
		Link,
		Modal,
		Pagination,
		PasswordInput,
		ProgressBar,
		SideNav,
		SideNavDivider,
		SideNavItems,
		SideNavLink,
		SideNavMenu,
		TextArea,
		TextInput,
		Tile,
		Toggle,
		ToggleSkeleton,
		Toolbar,
		ToolbarContent,
		ToolbarMenu,
		ToolbarMenuItem,
		ToolbarSearch
	} from 'carbon-components-svelte';
	// icons
	import {
		Add,
		Asleep,
		Book,
		Box,
		Calendar,
		CalendarSettings,
		Catalog,
		CatalogPublish,
		Categories,
		ContainerSoftware,
		Dashboard,
		Debug,
		Edit,
		Education,
		EventSchedule,
		Events,
		Filter,
		GroupObjectsNew,
		HardwareSecurityModule,
		Information,
		Logout,
		Money,
		Notebook,
		NotebookReference,
		Partnership,
		Recycle,
		Report,
		Save,
		Settings,
		SettingsAdjust,
		Stethoscope,
		TrashCan,
		UserSponsor,
		Wallet
	} from 'carbon-icons-svelte';
	// pictograms
	// firebase
	import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
	import { db } from '../../../firebase';
	// for password hashing
	import bcrypt from 'bcryptjs';
	// #endregion
	// #region database values
	let pageID = '/academic/sections';
	let dbConn = false;
	// schoolyear data
	let schlID = '0303001',
		acadYR = '2023-2024',
		acadSM = 'Second';
	// database values
	const getSchoolID = doc(db, schlID, acadYR);
	const getUsers = collection(db, schlID, 'data', 'users');
	const getSects = collection(db, schlID, 'data', 'sections');
	// user data
	let userID = '',
		userCL = '',
		userST = false,
		userRP = false,
		userUN = '',
		userPW = '',
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
		userAD = '',
		userMA = '',
		userFA = '',
		userGA = '',
		userCP = '',
		userCR = '',
		userCN = 0,
		userEC = 0;
	// sect data
	let sectID = '',
		sectST = false,
		sectYR = '',
		sectNM = '',
		sectAV = '',
		sectTS = '',
		sectTM = '',
		sectTF = '',
		sectAY = '';
	// login data
	let nputUN = '',
		nputPW = '',
		nputLR = '';
	let invaUN = false,
		invaPW = false;
	// local stored
	let loclID = '',
		loclCL = '',
		loclFN = '',
		loclTM = 'g10'; // "white" | "g10" | "g80" | "g90" | "g100"
	// bugreports
	let probID = '',
		probTT = '',
		probDC = '',
		probST = '';
	// progress
	let progTX = '',
		headTX = '',
		descTX = '';
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
	function generateProbID() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		let result = '';
		for (let i = 0; i < 6; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		probID = result;
	}

	async function reportProb(event) {
		if (probID === '' || probTT === '' || probDC === '') {
			return;
		}

		try {
			const reportData = {
				probID,
				pageID,
				probTT,
				probDC,
				probST: 'unsolved'
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

	let sectHeader = [
		{ key: 'sectAY', value: 'Academic Year' },
		{ key: 'sectID', value: 'Section ID' },
		{ key: 'sectYR', value: 'Section Year' },
		{ key: 'sectNM', value: 'Section Name' },
		{ key: 'sectST', value: 'Activated?' }
	];

	let sectRow = [];
	let sectSize = 10;
	let sectPage = 1;

	let maleHeader = [{ key: 'fullName', value: 'Student Name' }];

	let maleRow = [];
	let maleSize = 10;
	let malePage = 1;

	let femlHeader = [{ key: 'fullName', value: 'Student Name' }];

	let femlRow = [];
	let femlSize = 10;
	let femlPage = 1;

	let combRow = [];

	let combHeader = [
		{ key: 'male', value: 'Male Students' },
		{ key: 'female', value: 'Female Students' }
	];

	function loadTable() {
		loadData();
		combRow = maleRow.concat(femlRow);
		combRow = combRow.map((item, index) => ({
			id: item.id,
			male: maleRow[index] ? maleRow[index].fullName : '', // Assuming 'fullName' is the property name for male names
			female: femlRow[index] ? femlRow[index].fullName : '' // Assuming 'fullName' is the property name for female names
		}));
	}

	// Create a new array that represents rows with male and female data side by side

	let selectedRowIds = []; // get toggled radio

	async function getSectData() {
		// const q = query(getUsers, where('userCL', '!=', 'student'));
		const q = query(getSects);
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadSectData() {
		const data = await getSectData();
		sectRow = data.map((item) => ({
			id: item.sectID,
			sectID: item.sectID,
			sectST: item.sectST,
			sectYR: item.sectYR,
			sectNM: item.sectNM,
			sectAV: item.sectAV,
			sectTS: item.sectTS,
			sectTM: item.sectTM,
			sectTF: item.sectTF,
			sectAY: item.sectAY
		}));
	}

	async function fetchSelected(referenceCode) {
		const q = query(getSects, where('sectID', '==', referenceCode));
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
			sectID = data.sectID;
			sectST = data.sectST;
			sectYR = data.sectYR;
			sectNM = data.sectNM;
			sectAV = data.sectAV;
			sectTS = data.sectTS;
			sectTM = data.sectTM;
			sectTF = data.sectTF;
			sectAY = data.sectAY;
		} else {
			// clear fields
			userLN = '';
			userFN = '';
			userMN = '';
		}
	}

	async function updateSelected() {
		const updatedData = {
			sectID: sectID,
			sectST: sectST,
			sectYR: sectYR,
			sectNM: sectNM,
			sectAV: sectAV,
			sectTS: sectTS,
			sectTM: sectTM,
			sectTF: sectTF,
			sectAY: sectAY
		};

		const q = query(getSects, where('sectID', '==', selectedRowIds.toString()));
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
			loadSectData();
			edit = false;
		} catch (error) {
			edit = false;
			console.error('Error updating document:', error);
		}
	}

	async function registerSect(event) {
		event.preventDefault();

		// Construct the data object
		const sectData = {
			sectID: sectID,
			sectST: sectST,
			sectYR: sectYR,
			sectNM: sectNM,
			sectAV: sectAV,
			sectTS: sectTS,
			sectTM: sectTM,
			sectTF: sectTF,
			sectAY: sectAY
		};

		try {
			await uploadSect(sectData);
			loadSectData();
		} catch (e) {
			console.log('Failed to save data. Please try again.');
		}
	}

	async function uploadSect(data) {
		try {
			const docRef = await addDoc(collection(db, schlID, 'data', 'sections'), data);
			console.log('Document written with ID: ', docRef.id);
			return docRef.id; // you can return the ID to further use it if needed
		} catch (e) {
			console.error('Error adding document: ', e);
			throw e; // re-throwing the error for the caller to handle
		}
	}

	async function getMales() {
		const q = query(getUsers, where('userSC', '==', sectID), where('userSX', '==', 'Male'));
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadMales() {
		try {
			const data = await getMales(); // Pass the selected userSC to the function
			maleRow = data.map((item) => ({
				id: item.userID,
				userLN: item.userLN,
				userFN: item.userFN,
				userMN: item.userMN,
				fullName: `${item.userLN}, ${item.userFN} ${item.userMN}`
			}));
		} catch (error) {
			console.error('Error loading males data:', error);
		}
	}

	async function getFemales() {
		const q = query(getUsers, where('userSC', '==', sectID), where('userSX', '==', 'Female'));
		const snapshot = await getDocs(q);
		const data = snapshot.docs.map((doc) => doc.data());
		return data;
	}

	async function loadFemales() {
		try {
			const data = await getFemales(); // Pass the selected userSC to the function
			femlRow = data.map((item) => ({
				id: item.userID,
				userLN: item.userLN,
				userFN: item.userFN,
				userMN: item.userMN,
				fullName: `${item.userLN}, ${item.userFN} ${item.userMN}`
			}));
		} catch (error) {
			console.error('Error loading males data:', error);
		}
	}

	async function loadData() {
		await loadMales();
		await loadFemales();
	}

	// #endregion
	onMount(async () => {
		loclTM = localStorage.getItem('loclTM'); // get stored theme on load
		document.documentElement.setAttribute('theme', loclTM); // set selected theme on load

		try {
			progTX = 'Connecting...';
			await getDocs(getUsers);
			console.log('Connected.');

			dbConn = true;

			loclID = localStorage.getItem('userID');
			loclCL = localStorage.getItem('userCL');
			loclFN = localStorage.getItem('userFN');

			headTX = 'Select a module.';
			descTX = 'On the sidebar, choose the module that you want to work on.';
		} catch (error) {
			console.error('Failed. :', error);
			dbConn = false;
		}

		loadSectData();
	});
</script>

<Header company="Project" platformName="JOAN" href="/home">
	<div class="text-white hidden lg:flex">Section Management</div>
	<HeaderUtilities>
		<div class="flex">
			<div class="flex">
				<Button
					on:click={() => (reportBugMD00 = true)}
					tooltipPosition="left"
					iconDescription="Report a bug"
					kind="ghost"
					icon={Debug}
				/>
				<Button
					on:click={toggleDark}
					tooltipPosition="left"
					iconDescription="Dim"
					kind="secondary"
					icon={Asleep}
				/>
				<Button
					on:click={handleLogout}
					tooltipPosition="left"
					iconDescription="Logout"
					kind="danger"
					icon={Logout}
				/>
			</div>
		</div>
	</HeaderUtilities>
</Header>

{#if dbConn}
	<SideNav bind:isOpen={sideBR} rail>
		{#if loclCL === 'god'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Debug} href="/bugs" text="Reported Bugs" />
				<SideNavDivider />
				<SideNavMenu expanded icon={SettingsAdjust} text="Management Modules">
					<SideNavLink href="/administrator/users" text="User Management" />
					<SideNavLink href="/administrator/sections" text="Section Management" />
					<SideNavLink href="/administrator/subjects" text="Subject Management" />
					<SideNavLink href="/administrator/schedules" text="Schedule Management" />
					<SideNavLink href="/administrator/bulletin" text="Bulletin Management" />
				</SideNavMenu>
				<SideNavMenu icon={Education} text="Academic Modules">
					<SideNavLink href="/academic/admission" text="Admissions" />
					<SideNavLink href="/academic/enrollment" text="Enrolments" />
					<SideNavLink isSelected href="/academic/sections" text="Sections" />
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
				<SideNavLink icon={Information} href="/about" text="System Information" />
				<SideNavLink icon={Report} href="/reports" text="System Reports" />
				<SideNavLink icon={Settings} href="/defaults" text="System Settings" />
				<SideNavDivider />
				<SideNavMenu icon={Box} text="Archives">
					<SideNavLink href="/archives/system" text="System Archives" />
					<SideNavLink href="/archives/student" text="Student Archives" />
					<SideNavLink href="/archives/employee" text="Employee Archives" />
				</SideNavMenu>
				<SideNavDivider />
				<SideNavLink icon={EventSchedule} href="/schedules" text="Class Schedules" />
			</SideNavItems>
		{:else if loclCL === 'administrator'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Events} href="/administrator/users" text="User Management" />
				<SideNavLink
					icon={NotebookReference}
					href="/administrator/subjects"
					text="Subject Management"
				/>
				<SideNavLink icon={Categories} href="/administrator/subjects" text="Subject Management" />
				<SideNavLink
					icon={CalendarSettings}
					href="/administrator/schedules"
					text="Schedule Management"
				/>
				<SideNavLink
					icon={CatalogPublish}
					href="/administrator/bulletin"
					text="Bulletin Management"
				/>
				<SideNavDivider />
				<SideNavLink icon={Information} href="/about" text="System Information" />
				<SideNavLink icon={Report} href="/reports" text="System Reports" />
				<SideNavLink icon={Settings} href="/defaults" text="System Settings" />
				<SideNavDivider />
				<SideNavLink icon={EventSchedule} href="/schedules" text="Class Schedules" />
				<SideNavDivider />
				<SideNavMenu icon={Box} text="Archives">
					<SideNavLink href="/archives/system" text="System Archives" />
					<SideNavLink href="/archives/student" text="Student Archives" />
					<SideNavLink href="/archives/employee" text="Employee Archives" />
				</SideNavMenu>
			</SideNavItems>
		{:else if loclCL === 'admission'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={GroupObjectsNew} href="/academic/admission" text="Admissions" />
				<SideNavLink icon={Notebook} href="/academic/subjects" text="Subjects" />
			</SideNavItems>
		{:else if loclCL === 'registrar'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Education} href="/academic/enrollment" text="Enrolments" />
				<SideNavLink isSelected icon={Categories} href="/academic/sections" text="Sections" />
				<SideNavLink icon={Notebook} href="/academic/subjects" text="Subjects" />
				<SideNavLink icon={NotebookReference} href="/academic/gradebook" text="Gradebook" />
				<SideNavDivider />
				<SideNavLink icon={Box} href="/archives/student" text="Student Archives" />
			</SideNavItems>
		{:else if loclCL === 'cashier'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Money} href="/finance/transact" text="Financial Transactions" />
				<SideNavLink icon={Wallet} href="/finance/defaults" text="Financial Settings" />
			</SideNavItems>
		{:else if loclCL === 'guidance'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={UserSponsor} href="/guidance/records" text="Guidance Records" />
				<SideNavLink icon={Partnership} href="/guidance/defaults" text="Guidance Settings" />
				<SideNavDivider />
				<SideNavLink icon={EventSchedule} href="/schedules" text="Class Schedules" />
			</SideNavItems>
		{:else if loclCL === 'faculty'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Notebook} href="/academic/subjects" text="Subjects" />
				<SideNavLink icon={NotebookReference} href="/academic/gradebook" text="Gradebook" />
				<SideNavDivider />
				<SideNavLink icon={EventSchedule} href="/schedules" text="Class Schedules" />
			</SideNavItems>
		{:else if loclCL === 'librarian'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Book} href="/library" text="Library Management" />
			</SideNavItems>
		{:else if loclCL === 'nurse'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Stethoscope} href="/health" text="Health Records" />
			</SideNavItems>
		{:else if loclCL === 'student'}
			<SideNavItems>
				<SideNavLink icon={Dashboard} href="/dashboard" text="Dashboard" />
				<SideNavDivider />
				<SideNavLink icon={Calendar} href="/student/schedules" text="Class Schedules" />
				<SideNavLink icon={Catalog} href="/student/grades" text="Subject Grades" />
				<SideNavLink icon={Money} href="/student/transactions" text="Balance & Transactions" />
			</SideNavItems>
		{:else if loclCL === 'employee'}
			<SideNavItems />
		{:else}
			<!-- return to login if no stored class -->
			{goto('/login')}
		{/if}
	</SideNav>

	{#if loclCL === 'god' || loclCL === 'administrator' || loclCL === 'registrar'}
		<div class="flex flex-col h-auto pl-12 pt-12">
			<Content>
				<div class="flex flex-col gap-3 w-full">
					<div class="flex md:hidden lg:hidden">
						<p>
							If you are seeing this message, your screen is too small.<br /><br />Change to a
							device with a larger screen or rotate your device to view the master table.
						</p>
					</div>
					<div class="hidden md:flex lg:flex gap-3">
						<div class="w-screen">
							<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
								<h6 class="text-white">Section Masterlist</h6>
							</div>
							<DataTable
								bind:selectedRowIds
								on:click:row--select={handleSelected}
								radio
								zebra
								sortable
								size="short"
								headers={sectHeader}
								rows={sectRow}
								page={sectPage}
								pageSize={sectSize}
							>
								<Toolbar>
									<ToolbarContent>
										<ToolbarSearch shouldFilterRows />
										<Button
											on:click={loadSectData}
											kind="ghost"
											icon={Recycle}
											iconDescription="Reload"
											tooltipPosition="left"
										/>
										<Button
											on:click={() => (edit = true)}
											disabled={edit}
											kind="tertiary"
											icon={Edit}
											iconDescription="Edit Selected"
											tooltipPosition="left"
										/>
										<Button
											disabled={!edit}
											on:click={updateSelected}
											kind="primary"
											icon={Save}
											iconDescription="Save Changes"
											tooltipPosition="left"
										/>
									</ToolbarContent>
								</Toolbar>
							</DataTable>
							<Pagination
								bind:pageSize={sectSize}
								bind:page={sectPage}
								totalItems={sectRow.length}
								pageSizeInputDisabled
							/>
						</div>
					</div>
					<div class="flex flex-col lg:flex-row gap-3">
						<div class="w-full">
							<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
								<h6 class="text-white">Section Information</h6>
							</div>
							<Tile class="flex flex-col w-full lg:flex-row">
								<div class="flex flex-col w-full gap-3">
									<div class="flex flex-col gap-3">
										<div class="flex flex-col lg:flex-row gap-3">
											<TextInput
												bind:value={sectAY}
												labelText="Academic Year"
												placeholder="Section academic year"
												readonly
											/>
											<TextInput
												bind:value={sectID}
												labelText="Section ID"
												placeholder="Section ID here"
												readonly
											/>
											<TextInput
												bind:value={sectYR}
												labelText="Section Year Level"
												placeholder="Section Year Level"
												readonly
											/>
											<TextInput
												bind:value={sectNM}
												labelText="Section Name"
												placeholder="Section name here"
												readonly={!edit}
											/>
										</div>
									</div>
								</div>
							</Tile>
						</div>
					</div>
					<div class="flex flex-col lg:flex-row gap-3">
						<div class="flex flex-col gap-3 w-full lg:w-1/2">
							<div class="w-full">
								<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
									<h6 class="text-white">Male Students</h6>
								</div>
								<div class="flex flex-col gap-3">
									<DataTable
										zebra
										sortable
										size="short"
										headers={maleHeader}
										rows={maleRow}
										page={malePage}
										pageSize={maleSize}
									>
										<Toolbar>
											<ToolbarContent>
												<ToolbarSearch shouldFilterRows />
												<Button
													on:click={loadTable}
													kind="ghost"
													icon={Recycle}
													iconDescription="Reload"
													tooltipPosition="left"
												/>
											</ToolbarContent>
										</Toolbar>
									</DataTable>
								</div>
							</div>
						</div>
						<div class="flex flex-col gap-3 w-full lg:w-1/2">
							<div class="w-full">
								<div class="flex items-center justify-between h-8 pl-3 bg-stone-900">
									<h6 class="text-white">Female Students</h6>
								</div>
								<div class="flex flex-col gap-3">
									<DataTable
										zebra
										sortable
										size="short"
										headers={femlHeader}
										rows={femlRow}
										page={femlPage}
										pageSize={femlSize}
									>
										<Toolbar>
											<ToolbarContent>
												<ToolbarSearch shouldFilterRows />
												<Button
													on:click={loadData}
													kind="ghost"
													icon={Recycle}
													iconDescription="Reload"
													tooltipPosition="left"
												/>
											</ToolbarContent>
										</Toolbar>
									</DataTable>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Content>
		</div>
	{:else}
		<div class="flex flex-col h-screen justify-center lg:flex-row pl-10">
			<!-- displayed on mobile -->
			<Content class="self-center">
				<h1>Access Unauthorized.</h1>
				<br />
				<p>
					Hello, <strong>{loclFN}</strong>. You are not allowed to access this module.
					<br />
					<Link href="/home">Return home.</Link>
				</p>
			</Content>
			<Content />
		</div>
	{/if}
{:else}
	<div class="flex flex-col items-stretch lg:flex-row">
		<!-- displayed on mobile -->
		<Content id="#" class="flex flex-col bg-neutral-900 h-60 lg:hidden">
			<ProgressBar size="md" helperText={progTX} />
		</Content>
		<Content id="#" class="bg-neutral-900 w-1/3 h-screen hidden lg:flex" />
		<Content class="self-center w-11/12 lg:w-2/5">
			<ProgressBar size="md" helperText={progTX} />
		</Content>
		<Content />
	</div>
{/if}
<!-- #region modals -->
<!-- reportbug -->
<Modal
	on:click:button--primary={async () => {
		try {
			await reportProb();
			reportBugMD02 = true;
		} catch (error) {
			reportBugMD02 = false;
		}
		reportBugMD01 = false;
	}}
	bind:open={reportBugMD00}
	on:open={() => ((reportBugMD01 = true), (reportBugMD02 = false))}
	modalHeading={reportBugMD01 ? 'Report a bug' : reportBugMD02 ? 'Bug reported' : ''}
	primaryButtonText="Submit"
	size={reportBugMD02 ? 'xs' : !reportBugMD01 ? 'xs' : 'md'}
	passiveModal={reportBugMD02 || !reportBugMD01}
>
	{#if reportBugMD01}
		<br />
		<h6 class="flex flex-col">Tell us more about your encountered problem.</h6>
		<br />
		<div class="flex flex-col gap-3">
			<div class="flex flex-col gap-3 lg:flex-row">
				<TextInput bind:value={pageID} labelText="Page Link" placeholder={pageID} readonly />
				<TextInput
					bind:value={probID}
					labelText="Problem ID"
					placeholder="System-generated problem ID"
					readonly
				/>
			</div>
			<div class="flex flex-col lg:flex-row">
				<TextInput
					bind:value={probTT}
					on:change={generateProbID}
					labelText="Problem Title"
					placeholder="Provide a short description of the problem you encountered"
					required
				/>
			</div>
			<div class="flex flex-col lg:flex-row">
				<TextArea
					placeholder="Provide an in-depth description of the problem you encountered"
					bind:value={probDC}
					required
				/>
			</div>
		</div>
	{:else if reportBugMD02}
		<br />
		<h5>Thanks for your feedback!</h5>
		<br />
		<p class="italic">
			We intend to make Project JOAN a cohesive and effective application. We value your feedback
			regarding problems you face while using the application.
		</p>
	{:else if !reportBugMD02}
		<br />
		<p>Error reporting bug. Make sure to fill up all fields.</p>
	{/if}
</Modal>
<Modal
	bind:open={accountSTMD00}
	on:click:button--primary={() => (editAC = false)}
	on:click:button--primary={() => (accountSTMD01 = true)}
	on:click:button--secondary={() => (editAC = true)}
	modalHeading="Account Information"
	primaryButtonText="Save"
	primaryButtonDisabled={!editAC}
	secondaryButtonText="Edit"
	hasScrollingContent
>
	<Content>
		<div class="flex flex-col lg:flex-row">
			<div class="w-full lg:w-1/4 lg:self-center">
				<h6 class="underline">Login Details</h6>
			</div>
			<br />
			<div class="flex flex-col w-full gap-3">
				<TextInput labelText="Account ID" placeholder="System-generated account ID" readonly />
				<TextInput labelText="Username" placeholder="System-generated username" readonly />
				<PasswordInput
					labelText="Password"
					placeholder="Your password"
					tooltipPosition="left"
					disabled={!editAC}
				/>
				<TextInput labelText="Current User Class" placeholder="Designated user-class" readonly />
			</div>
		</div>
		<br />
		<hr class="outline-black" />
		<br />
		{#if loclCL === 'student'}
			<div class="flex flex-col lg:flex-row">
				<div class="w-full lg:w-1/4 lg:self-center">
					<h6 class="underline">Student Information</h6>
				</div>
				<br />
				<div class="flex flex-col w-full">
					<div class="flex flex-col w-full gap-3">
						<TextInput labelText="Last Name" placeholder="Your last name" readonly={!editAC} />
						<TextInput labelText="First Name" placeholder="Your first name" readonly={!editAC} />
						<TextInput labelText="Middle Name" placeholder="Your middle name" readonly={!editAC} />
						<TextInput
							labelText="Suffix (if any)"
							placeholder="Sr., Jr., III., etc."
							readonly={!editAC}
						/>
						<TextInput
							labelText="Student Address"
							placeholder="Your complete address"
							readonly={!editAC}
						/>
					</div>
					<br />
					<div class="flex flex-col w-full lg:flex-row gap-3">
						<TextInput
							labelText="Student Contact Number"
							placeholder="Your contact number"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Emergency Contact Number"
							placeholder="Your emergency contact number"
							readonly={!editAC}
						/>
					</div>
					<br />
					<div class="flex flex-col w-full gap-3">
						<TextInput
							labelText="Mother's Name"
							placeholder="Your mother's name"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Father's Name"
							placeholder="Your father's name"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Guardian's Name"
							placeholder="Your guardian's name"
							readonly={!editAC}
						/>
					</div>
				</div>
			</div>
		{:else}
			<div class="flex flex-col lg:flex-row">
				<div class="w-full lg:w-1/4 lg:self-center">
					<h6 class="underline">Personal Information</h6>
				</div>
				<br />
				<div class="flex flex-col w-full">
					<div class="flex flex-col w-full gap-3">
						<TextInput
							labelText="Last Name"
							placeholder="Enter your last name"
							readonly={!editAC}
						/>
						<TextInput
							labelText="First Name"
							placeholder="Enter your first name"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Middle Name"
							placeholder="Enter your middle name"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Suffix (if any)"
							placeholder="Sr., Jr., III., etc."
							readonly={!editAC}
						/>
						<TextInput
							labelText="Employee Address"
							placeholder="Enter your complete address"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Employee Contact Number"
							placeholder="Your contact number"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Emergency Contact Number"
							placeholder="Your emergency contact number"
							readonly={!editAC}
						/>
					</div>
					<br />
					<div class="flex flex-col w-full gap-3">
						<TextInput
							labelText="Contact Person"
							placeholder="Enter your contact person's name"
							readonly={!editAC}
						/>
						<TextInput
							labelText="Relation (optional)"
							placeholder="Your relationship to your contact person"
							readonly={!editAC}
						/>
					</div>
				</div>
			</div>
		{/if}
	</Content>
</Modal>
<Modal
	bind:open={accountSTMD01}
	on:close={() => (accountSTMD01 = false)}
	modalHeading="Account Details Changed"
	passiveModal
>
	Success
</Modal>

<!-- #endregion -->


