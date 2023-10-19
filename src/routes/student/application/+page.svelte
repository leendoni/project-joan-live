<script>
	import {
		Button,
		ButtonSkeleton,
		Checkbox,
		CheckboxSkeleton,
		ComboBox,
		Content,
		Header,
		HeaderUtilities,
		Modal,
		SkeletonText,
		TextArea,
		TextInput,
		TextInputSkeleton
	} from 'carbon-components-svelte';

	import { Debug, Home, Moon, PenFountain } from 'carbon-icons-svelte';

	import { addDoc, collection, doc, getDocs, query, where } from 'firebase/firestore';
	import { db } from '../../../firebase';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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
		userCL = 'student',
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

	// database values
	const getUsers = collection(db, schlID, 'data', 'users');

	let pageID = '/student/application';
	let dbConn = false;

	// confirm
	let confirm = false;
	let invalid = true;
	// modals
	let reportBugMD00 = false, // open
		reportBugMD01 = false, // default
		reportBugMD02 = false; // success
	let studApplyMD00 = false, // open
		studApplyMD01 = false, // default
		studApplyMD02 = false; // success

	function goHome() {
		goto('/');
	}

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

	function makeUserID() {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		let result = '';
		for (let i = 0; i < 8; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}

		userID = result;
	}

	async function checkUserCN(value) {
		const getUsers = collection(db, schlID, 'data', 'users');
		const q = query(getUsers, where('userCN', '==', value));
		const snapshot = await getDocs(q);
		return !snapshot.empty; // Returns true if the entry exists
	}

	async function registerUser(event) {
		let fillST, xistST;
		let duplCN = await checkUserCN(userCN);

		// check empty
		if (
			userDP == '' ||
			userLN == '' ||
			userFN == '' ||
			userMN == '' ||
			userSX == '' ||
			userCN == 0 ||
			userAD == '' ||
			userFA == '' ||
			userMA == '' ||
			userEC == 0 ||
			userCP == '' ||
			userID == ''
		) {
			confirm = false;
			fillST = false;
			studApplyMD01 = true; // fill all modal
		} else {
			fillST = true;
		}

		if (duplCN) {
			confirm = false;
			xistST = true;
			studApplyMD02 = true; // exists modal
		} else {
			xistST = false;
		}

		if (fillST && !xistST) {
			confirm = false;

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
			if (duplCN) {
				return; // Don't proceed with saving the data if there are duplicates
			} else {
				try {
					await uploadUser(userData);
					studApplyMD00 = true; // success modal
				} catch (e) {
					console.log('Failed to save data. Please try again.');
				}
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
	<div class="text-white hidden lg:flex">Student Application</div>
	<HeaderUtilities>
		<Button
			on:click={() => (reportBugMD00 = true)}
			icon={Debug}
			iconDescription="Report a bug"
			tooltipPosition="left"
			kind="ghost"
		/>
		<Button href="/" icon={Home} iconDescription="Register" tooltipPosition="left" />
	</HeaderUtilities>
</Header>

{#if dbConn}
	<div class="flex w-full h-64 items-end text-white bg-neutral-900">
		<Content>
			<h1>Student Application</h1>
		</Content>
	</div>

	<div class="flex flex-col">
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Basic Information</p>
			</div>
			<div class="flex flex-col lg:grid lg:grid-cols-2 w-full lg:w-3/4 gap-4">
				<ComboBox
					bind:value={userDP}
					titleText="Department"
					placeholder="Select department"
					items={[
						{ id: '0', text: 'Elementary' },
						{ id: '1', text: 'Junior High School' },
						{ id: '2', text: 'Senior High School' }
					]}
				/>
				<TextInput
					bind:value={acadAY}
					labelText="Academic Year"
					placeholder="Current academic year"
					readonly
				/>
				{#if userDP === 'Elementary'}
					<ComboBox
						bind:value={userYR}
						titleText="Grade Level"
						placeholder="Select grade level"
						items={[
							{ id: '0', text: 'Kindergarten' },
							{ id: '1', text: 'Grade 01' },
							{ id: '2', text: 'Grade 02' },
							{ id: '3', text: 'Grade 03' },
							{ id: '4', text: 'Grade 04' },
							{ id: '5', text: 'Grade 05' },
							{ id: '6', text: 'Grade 06' }
						]}
					/>
				{/if}
				{#if userDP === 'Junior High School'}
					<ComboBox
						bind:value={userYR}
						titleText="Grade Level"
						placeholder="Select grade level"
						items={[
							{ id: '0', text: 'Grade 07' },
							{ id: '1', text: 'Grade 08' },
							{ id: '2', text: 'Grade 09' },
							{ id: '3', text: 'Grade 10' }
						]}
					/>
				{/if}
				{#if userDP === 'Senior High School'}
					<ComboBox
						bind:value={userYR}
						titleText="Grade Level"
						placeholder="Select grade level"
						items={[
							{ id: '0', text: 'Grade 11' },
							{ id: '1', text: 'Grade 12' }
						]}
					/>
					<ComboBox
						bind:value={userSM}
						titleText="Semester"
						placeholder="Select semester"
						items={[
							{ id: '0', text: 'First' },
							{ id: '1', text: 'Second' },
							{ id: '2', text: 'Summer' }
						]}
					/>
				{/if}
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<p class="text-sm underline">Personal Information</p>
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInput bind:value={userLN} labelText="Last Name" placeholder="Your last name" />
					<TextInput bind:value={userFN} labelText="First Name" placeholder="Your first name" />
					<TextInput bind:value={userMN} labelText="Middle Name" placeholder="Your middle name" />
					<TextInput bind:value={userSF} labelText="Suffix" placeholder="Sr., Jr., III., etc." />
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
					/>
					<TextInput
						bind:value={userCN}
						labelText="Contact Number"
						placeholder="9876543210"
						type="number"
					/>
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInput bind:value={userAD} labelText="Address" placeholder="Your address" />
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInput
						bind:value={userFA}
						labelText="Father's Name"
						placeholder="Your father's name"
					/>
					<TextInput
						bind:value={userMA}
						labelText="Mother's Name"
						placeholder="Your mother's name"
					/>
					<TextInput
						bind:value={userGA}
						labelText="Guardian's Name"
						placeholder="Your guardian's name"
					/>
				</div>
				<div class="flex flex-col lg:grid lg:grid-cols-3 gap-4">
					<TextInput
						bind:value={userEC}
						labelText="Emergency Contact Number"
						placeholder="9876543210"
						type="number"
					/>
					<TextInput
						bind:value={userCP}
						labelText="Emergency Contact Person"
						placeholder="Your emergency contact person"
					/>
					<TextInput
						bind:value={userCR}
						labelText="Emergency Contact Relation"
						placeholder="Your emergency contact relation"
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
					<TextInput
						bind:value={userID}
						labelText="Account ID"
						placeholder="System-generated ID"
						readonly
					/>
					<TextInput
						bind:value={userUN}
						labelText="Username"
						placeholder="Generated upon enrollment"
						readonly
					/>
				</div>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4 justify-between items-center">
			<Checkbox
				bind:checked={confirm}
				on:click={makeUserID}
				labelText="I certify that the information above is correct."
			/>
			<Button on:click={registerUser} disabled={!confirm} icon={PenFountain}>Register</Button>
		</Content>
	</div>
{:else}
	<div class="flex w-full h-64 items-end text-white bg-neutral-900">
		<Content>
			<SkeletonText />
		</Content>
	</div>

	<div class="flex flex-col">
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<SkeletonText />
			</div>
			<div class="flex flex-col lg:grid lg:grid-cols-2 w-full lg:w-3/4 gap-4">
				<ComboBox
					disabled
					bind:value={userDP}
					titleText="Department"
					placeholder="Select department"
					items={[
						{ id: '0', text: 'Elementary' },
						{ id: '1', text: 'Junior High School' },
						{ id: '2', text: 'Senior High School' }
					]}
				/>
				<TextInputSkeleton />
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<SkeletonText />
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInputSkeleton />
					<TextInputSkeleton />
					<TextInputSkeleton />
					<TextInputSkeleton />
				</div>
				<div class="flex flex-col lg:grid lg:grid-cols-2 gap-4">
					<ComboBox
						disabled
						bind:value={userSX}
						titleText="Gender"
						placeholder="Select gender"
						items={[
							{ id: '0', text: 'Male' },
							{ id: '1', text: 'Female' }
						]}
					/>
					<TextInputSkeleton />
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInputSkeleton />
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInputSkeleton />
					<TextInputSkeleton />
					<TextInputSkeleton />
				</div>
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInputSkeleton />
					<TextInputSkeleton />
					<TextInputSkeleton />
				</div>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4">
			<div class="w-full lg:w-1/4">
				<SkeletonText />
			</div>
			<div class="flex flex-col w-full lg:w-3/4 gap-4">
				<div class="flex flex-col lg:flex-row gap-4">
					<TextInputSkeleton />
					<TextInputSkeleton />
				</div>
			</div>
		</Content>
		<Content class="flex flex-col lg:flex-row w-full gap-4 justify-between items-center">
			<CheckboxSkeleton />
			<ButtonSkeleton />
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
	bind:open={studApplyMD00}
	on:close={goHome}
	modalHeading="Application Received!"
	size="xs"
	passiveModal
>
	<div class="flex flex-col content-center">
		<div>
			<br />
			<p class="italic">Account Code:</p>
			<h3>{userID}</h3>
			<br />
		</div>
		<div>
			<p class="italic">
				Important: <strong>Jot down your account code or take a screenshot</strong> as this will be presented
				upon enrollment.
			</p>
		</div>
	</div>
</Modal>
<Modal bind:open={studApplyMD01} modalHeading="Application Denied." size="xs" passiveModal>
	<div class="flex flex-col content-center">
		<div>
			<p class="italic">
				Make sure to fill up all required fields before submitting your application.
			</p>
		</div>
	</div>
</Modal>
<Modal bind:open={studApplyMD02} modalHeading="Duplicate Application." size="xs" passiveModal>
	<div class="flex flex-col content-center">
		<div>
			<p class="italic">The contact number you used is already in use by another applicant.</p>
		</div>
	</div>
</Modal>
