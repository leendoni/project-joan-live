<script>
	import {
		Button,
		ButtonSet,
		ButtonSkeleton,
		Checkbox,
		CheckboxSkeleton,
		ComboBox,
		Content,
		Header,
		HeaderUtilities,
		Modal,
		PasswordInput,
		Search,
		SkeletonText,
		TextArea,
		TextInput,
		TextInputSkeleton
	} from 'carbon-components-svelte';

	import { Debug, HelpFilled, Home, Login, Moon, PenFountain } from 'carbon-icons-svelte';

	import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
	import { db } from '../../firebase';

	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import bcrypt from 'bcryptjs';

	let schlID = '0303001',
		systST = false,
		mdulID = '',
		mdulST = false,
		acadAY = '2023-2024',
		acadSD = '',
		acadND = '',
		acadSM = '',
		acadQT = '';

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

	let axisAY = '',
		axisID = '',
		axisNM = '',
		axisDC = '',
		axisDT = '';

	// database values
	const getUsers = collection(db, schlID, 'data', 'users');

	let pageID = '/login';
	let dbConn = false;

	// login data
	let nputUN = '',
		nputPW = '',
		nputID = '';
	let invaUN = false,
		invaPW = false;

	// confirm
	let confirm = false;
	let invalid = true;
	// modals
	let reportBugMD00 = false, // open
		reportBugMD01 = false, // default
		reportBugMD02 = false; // success
	let resetPassMD00 = false, // open
		resetPassMD01 = false, // default
		resetPassMD02 = false; // success
	let inactvAccMD00 = false; // open

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

	async function handleLogin() {
		try {
			const q = query(getUsers, where('userUN', '==', nputUN));

			const snapshot = await getDocs(q);

			if (snapshot.empty) {
				invaUN = true;
				handleAccess();
				return;
			}

			const userData = snapshot.docs[0].data();

			userST = userData.userST;

			if (userST == true) {
				// Check the password using the function from before
				const isPasswordValid = await bcrypt.compare(nputPW, userData.userPW);

				if (isPasswordValid) {
					userID = userData.userID;
					userCL = userData.userCL;
					userFN = userData.userFN;

					localStorage.setItem('userID', userID);
					localStorage.setItem('userCL', userCL);
					localStorage.setItem('userFN', userFN);
					localStorage.setItem('userLG', 'true');

					handleAccess();
					goto('/dashboard');
				} else {
					invaPW = true;
				}
			} else {
				inactvAccMD00 = true;
			}
		} catch (error) {
			handleAccess();
			console.error('Login error:', error);
		}
	}

	async function handleAccess() {
		try {
			const formattedDate = generateDate(new Date());
			const data = {
				axisAY: '',
				axisID: loclID,
				axisNM: userLN + ', ' + userFN + userMN,
				axisDC: 'login',
				axisDT: formattedDate
			};

			await addDoc(collection(db, schlID, 'data', 'access'), data);
		} catch (error) {
			console.error('Failed to log access:', error);
		}
	}

	function generateDate(date) {
		const YYYY = date.getFullYear();
		const MM = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
		const DD = String(date.getDate()).padStart(2, '0');
		const HH = String(date.getHours()).padStart(2, '0');
		const MIN = String(date.getMinutes()).padStart(2, '0');
		const SS = String(date.getSeconds()).padStart(2, '0');

		return `${YYYY}${MM}${DD}-${HH}:${MIN}:${SS}`;
	}

	// load user data
	async function loadUserData() {
		// Fetch the user's data from Firestore using the entered username
		const q = query(getUsers, where('userID', '==', nputID));

		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			return;
		}

		const userData = snapshot.docs[0].data();

		console.log(userLN);

		userLN = userData.userLN;
		userFN = userData.userFN;
		userMN = userData.userMN;
	}

	// update user data
	async function updateUserData() {
		const updatedData = {
			userRP: true
		};

		const q = query(getUsers, where('userID', '==', nputID));
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
		} catch (error) {
			console.error('Error updating document:', error);
		}
	}

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
	});
</script>

<Header company="Project" platformName="JOAN" href="/">
	<div class="text-white hidden lg:flex">Login</div>
	<HeaderUtilities>
		<Button
			on:click={() => (reportBugMD00 = true)}
			icon={Debug}
			iconDescription="Report a bug"
			tooltipPosition="left"
			kind="ghost"
		/>
		<Button href="/" icon={Home} iconDescription="Home" tooltipPosition="left" />
	</HeaderUtilities>
</Header>

{#if dbConn}
	<div class="flex flex-col items-stretch lg:flex-row">
		<div class="flex w-full h-64 items-end text-white bg-neutral-900 lg:hidden">
			<Content>
				<h1>Log in</h1>
			</Content>
		</div>
		<Content class="bg-neutral-900 w-1/3 h-screen hidden lg:flex" />
		<Content class="self-center w-11/12 lg:w-2/5">
			<h1 class="hidden pb-8 lg:flex">Login</h1>
			<div class="flex flex-col gap-6">
				<TextInput
					bind:value={nputUN}
					invalid={invaUN}
					placeholder="Username"
					labelText="Username"
					size="xl"
					required
				/>
				<PasswordInput
					bind:value={nputPW}
					invalid={invaPW}
					type="password"
					placeholder="Password"
					labelText="Password"
					tooltipPosition="left"
					size="xl"
					required
				/>
				<ButtonSet stacked>
					<Button on:click={handleLogin} icon={Login}>Log in</Button>
					<Button on:click={() => (resetPassMD00 = true)} kind="ghost" icon={HelpFilled}
						>Forgot password?</Button
					>
				</ButtonSet>
			</div>
		</Content>
	</div>
{:else}
	<div class="flex flex-col items-stretch lg:flex-row">
		<div class="flex w-full h-64 items-end text-white bg-neutral-900 lg:hidden">
			<Content>
				<SkeletonText />
			</Content>
		</div>
		<Content class="bg-neutral-900 w-1/3 h-screen hidden lg:flex" />
		<Content class="self-center w-11/12 lg:w-2/5">
			<SkeletonText />
			<div class="flex flex-col gap-6">
				<TextInputSkeleton />
				<TextInputSkeleton />
				<ButtonSet stacked>
					<ButtonSkeleton />
					<ButtonSkeleton />
				</ButtonSet>
			</div>
		</Content>
	</div>
{/if}

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
	size={reportBugMD02 ? 'xs' : !reportBugMD01 ? 'xs' : 'sm'}
	passiveModal={reportBugMD02 || !reportBugMD01}
	primaryButtonText="Submit"
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
					bind:value={probNM}
					on:change={makeProbID}
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
	on:click:button--primary={async () => {
		try {
			await updateUserData();
			resetPassMD02 = true;
		} catch (error) {
			resetPassMD02 = false;
		}
		resetPassMD01 = false;
	}}
	on:click:button--secondary={() => {
		resetPassMD00 = false;
	}}
	bind:open={resetPassMD00}
	on:open={() => ((resetPassMD01 = true), (resetPassMD02 = false))}
	modalHeading={resetPassMD01
		? 'Reset your password'
		: resetPassMD02
		? 'Password reset requested'
		: ''}
	size={resetPassMD02 ? 'sm' : !resetPassMD01 ? 'xs' : 'xs'}
	passiveModal={resetPassMD02 || !resetPassMD01}
	primaryButtonText="Confirm"
	secondaryButtonText="Cancel"
>
	{#if resetPassMD01}
		<br />
		<h6 class="flex flex-col">It appears you have forgotten your password.</h6>
		<br />
		<p>Provide your Account Code to notify your system adminstrator to reset your account.</p>
		<br />
		<div class="flex flex-col gap-3">
			<div class="flex flex-row">
				<TextInput
					bind:value={nputID}
					labelText="Account ID"
					placeholder="Enter your account ID"
					required
				/>
				<div class="pt-6">
					<Button
						on:click={loadUserData}
						size="field"
						kind="secondary"
						iconDescription="Search"
						icon={Search}
						tooltipPosition="left">Search</Button
					>
				</div>
			</div>
			<div class="flex flex-col gap-3 lg:flex-row">
				<TextInput
					bind:value={userLN}
					readonly
					labelText="Last Name"
					placeholder="Your last name"
					required
				/>
				<TextInput
					bind:value={userFN}
					readonly
					labelText="First Name"
					placeholder="Your first name"
					required
				/>
				<TextInput
					bind:value={userMN}
					readonly
					labelText="Middle Name"
					placeholder="Your middle name"
					required
				/>
			</div>
		</div>
	{:else if resetPassMD02}
		<h5>A notification to reset your account has been sent to your System Administrator.</h5>
		<br />
		<h5 class="italic">Temporary Password:</h5>
		<h3>csjd.reset123</h3>
		<br />
		<p class="italic">
			Using the temporary password, try logging in to your account within 1-2 days from resetting
			your password. If the temporary password does not work within that period, contact your system
			administrator for a follow-up reset.
		</p>
	{:else if !resetPassMD02}
		<br />
		<p>Error resetting password. Please try again.</p>
	{/if}
</Modal>
<Modal bind:open={inactvAccMD00} modalHeading="Inactive Account" size="xs" passiveModal>
	<br />
	<h5>Your account is not yet activated. Enroll to activate / reactivate your account.</h5>
	<br />
	<p class="italic">
		To ensure system efficiency, student accounts get reset every semester. You must first enroll to
		the current semester to regain access to your account.
	</p>
</Modal>
