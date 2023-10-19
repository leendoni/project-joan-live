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
		Header,
		HeaderUtilities,
		Link,
		Modal,
		ProgressBar,
		SideNav,
		SideNavDivider,
		SideNavItems,
		SideNavLink,
		SideNavMenu,
		TextArea,
		TextInput,
		Tile
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
		GroupObjectsNew,
		Information,
		Logout,
		Money,
		Notebook,
		NotebookReference,
		Partnership,
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
	let pageID = '/administrator/bulletin';
	let dbConn = false;
	// schoolyear data
	let schlID = '0303001',
		acadYR = '2023-2024',
		acadSM = 'Second';
	// database values
	const getSchoolID = doc(db, schlID, acadYR);
	const getUsers = collection(db, schlID, 'data', 'users');
	// user data
	let userID = '',
		userCL = '',
		userST = false,
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
	// post data
	let postID = '',
		postBY = '',
		postTP = '',
		postCL = '',
		postTT = '',
		postDC = '',
		postSD = '',
		postED = '',
		postAY = '';
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
	let editPS = false;
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

	async function getUserData() {
		const q = query(getUsers, where('userID', '==', loclID));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			// No records found for the provided reference code
			console.log('getUserData: Empty records.');
			return null;
		}

		const userData = snapshot.docs[0].data();
		const pass = await bcrypt.compare(userPW, userData.userPW);
		userPW = pass;

		return snapshot.docs[0].data();
	}

	async function loadUserData() {
		console.log('load');
		const data = await getUserData(); // convert to string or it wont load

		if (data) {
			userID = data.userID;
			userCL = data.userCL;
			userST = data.userST;
			userUN = data.userUN;
			userPW = data.userPW;
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
			userAD = data.userAD;
			userMA = data.userMA;
			userFA = data.userFA;
			userGA = data.userGA;
			userCP = data.userCP;
			userCR = data.userCR;
			(userCN = data.userCN), (userEC = data.userEC);
		} else {
			userID = '';
			userCL = '';
			userST = false,
			userUN = '';
			userPW = '';
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
			userAD = '';
			userMA = '';
			userFA = '';
			userGA = '';
			userCP = '';
			userCR = '';
			(userCN = 0), (userEC = 0);
		}
	}

	async function createUserPW(userPW) {
		const salt = await bcrypt.genSalt(10); // Generate a salt
		const hash = await bcrypt.hash(userPW, salt); // Hash the password
		return hash;
	}

	async function updateUserData() {
		let updatedData;

		if (loclCL == 'student') {
			updatedData = {
				userID: userID,
				userCL: userCL,
				userST: userST,
				userUN: userUN,
				userLR: userLR,
				userLN: userLN,
				userFN: userFN,
				userMN: userMN,
				userSX: userSX,
				userAD: userAD,
				userMA: userMA,
				userFA: userFA,
				userCN: userCN,
				userCR: userCR,
				userCP: userCP,
				userEC: userEC
			};
		} else {
			updatedData = {
				userID: userID,
				userCL: userCL,
				userST: userST,
				userUN: userUN,
				userLN: userLN,
				userFN: userFN,
				userMN: userMN,
				userSX: userSX,
				userAD: userAD,
				userCP: userCP,
				userCR: userCR,
				userCN: userCN,
				userEC: userEC
			};
		}

		const q = query(getUsers, where('userID', '==', loclID));
		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			console.error('No records found for the selected reference code.');
			return;
		}

		const docId = snapshot.docs[0].id;
		const docRef = doc(getSchoolID, 'users', docId);

		try {
			await updateDoc(docRef, updatedData);
			console.log('Successfully updated');
		} catch (error) {
			console.error('Error updating document:', error);
		}
	}

	// #endregion
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
	});
</script>

<Header company="Project" platformName="JOAN" href="/home">
	<div class="text-white hidden lg:flex">Bulletin Management</div>
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
					on:click={goLogin}
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
					<SideNavLink isSelected href="/administrator/bulletin" text="Bulletin Management" />
				</SideNavMenu>
				<SideNavMenu icon={Education} text="Academic Modules">
					<SideNavLink href="/academic/admission" text="Admissions" />
					<SideNavLink href="/academic/enrollment" text="Enrolments" />
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
					isSelected
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
				<SideNavLink icon={Categories} href="/academic/sections" text="Sections" />
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

	{#if loclCL === 'god' || loclCL === 'administrator'}
		<div class="flex flex-col h-screen pl-10 pt-10">
			<Content>
				<div class="flex flex-col gap-3">
					<!-- campus bulletin -->
					<div class="w-full">
						<Tile class="rounded-xl h-96">
							<div class="flex flex-row items-center justify-between">
								<h6>Campus Bulletin</h6>
							</div>
							<div>
								<br />
								<div class="overflow-x-auto whitespace-nowrap w-full">
									<!-- announcement block -->
									<div class="inline-flex flex-col p-3 gap-3 w-full lg:w-1/4">
										<div class="h-2 rounded-lg bg-red-600" />
										<div class="flex flex-col w-full">
											<p class="italic text-sm"><strong>Announcement</strong></p>
											<p class="text-lg whitespace-normal">Title of post goes here</p>
											<p class="italic text-xs">Subtitle goes here</p>
										</div>
										<hr />
										<p class="inline-flex flex-col text-sm whitespace-normal">
											Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis orci eget
											massa vestibulum rhoncus. Suspendisse eget ex nec urna dapibus ultrices.
										</p>
										<hr />
										<div class="flex flex-col">
											<Button size="small" kind="ghost" icon={Edit}>Edit</Button>
											<Button size="small" kind="danger-tertiary" icon={TrashCan}>Delete</Button>
										</div>
									</div>
									<!-- announcement block -->
									<div class="inline-flex flex-col p-3 gap-3 w-full lg:w-1/4">
										<div class="h-2 rounded-lg bg-neutral-600" />
										<hr />
										<div class="flex flex-col w-full">
											<Button size="small" kind="ghost" icon={Add}>Create New</Button>
										</div>
									</div>
								</div>
							</div>
						</Tile>
					</div>
					<br />
					<hr />
					<br />
					<!-- edit selected -->
					<div class="w-full">
						<div class="flex flex-col lg:flex-row">
							<div class="w-full lg:w-1/4 lg:self-center">
								<h6 class="underline">Post Information</h6>
							</div>
							<br />
							<div class="flex flex-col w-full">
								<div class="flex flex-col w-full lg:flex-row gap-3">
									<TextInput
										bind:value={postID}
										labelText="Post ID"
										placeholder="System-generated ID"
										readonly
									/>
									<TextInput
										bind:value={postBY}
										labelText="Poster ID"
										placeholder="Your account ID"
										readonly
									/>
									<ComboBox
										bind:value={postTP}
										titleText="Post Type"
										placeholder="Select type"
										items={[
											{ id: '0', text: 'Information' },
											{ id: '1', text: 'Announcement' },
											{ id: '2', text: 'Suspension' },
											{ id: '3', text: 'Event' }
										]}
									/>
									<ComboBox
										bind:value={postCL}
										titleText="Post For"
										placeholder="Select user class"
										items={[
											{ id: '0', text: 'Students' },
											{ id: '1', text: 'Employees' }
										]}
									/>
								</div>
								<br />
								<div class="flex flex-col w-full lg:flex-row gap-3">
									<TextInput
										bind:value={postTT}
										labelText="Post Title"
										placeholder="Enter post title"
										readonly={!editPS}
									/>
								</div>
								<br />
								<div class="flex flex-col w-full lg:flex-row gap-3">
									<TextArea
										bind:value={postDC}
										maxCount={210}
										labelText="Post Title"
										placeholder="Enter post title"
										readonly={!editPS}
									/>
								</div>
								<br />
								<div class="flex flex-col w-full lg:flex-row gap-3">
									<TextInput
										bind:value={postSD}
										labelText="Starting Date"
										placeholder="Select date of visibility"
										type="date"
										readonly={!editPS}
									/>
									<TextInput
										bind:value={postED}
										labelText="Ending Date"
										placeholder="Select date of expiration"
										type="date"
										readonly={!editPS}
									/>
								</div>
							</div>
						</div>
						<br />
						<div class="flex justify-end">
							<Button size="default" kind="ghost" icon={Add}>Add</Button>
							<Button size="default" kind="primary" icon={Save}>Save</Button>
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
<!-- modals -->
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
