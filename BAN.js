const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const readline = require('readline');
const open = require('open');
const chalk = require('chalk');
const ora = require('ora');
const progress = require('cli-progress');
const moment = require('moment');
const weather = require('weather-js');

// Enhanced ASCII art with date/time
function displayAsciiArt() {
    const now = moment();
    const dateTime = now.format('dddd, MMMM Do YYYY, h:mm:ss a');
    
    const asciiArt = `
███████╗██╗  ██╗██████╗ ██╗██████╗ ███████╗██████╗ 
██╔════╝██║  ██║██╔══██╗██║██╔══██╗██╔════╝██╔══██╗
███████╗███████║██████╔╝██║██████╔╝█████╗  ██████╔╝
╚════██║██╔══██║██╔═══╝ ██║██╔══██╗██╔══╝  ██╔══██╗
███████║██║  ██║██║     ██║██║  ██║███████╗██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝

${chalk.yellow('𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠 𝗠𝗔𝗦𝗦 𝗥𝗘𝗣𝗢𝗥𝗧𝗘𝗥')}

${chalk.green('SCRIPT BY LORDHOZOO ')}

${chalk.blue(dateTime)}
`;

    console.log(asciiArt);
    
    // Get weather information
    weather.find({search: 'Jakarta, ID', degreeType: 'C'}, function(err, result) {
        if (err) console.log(chalk.yellow('Could not fetch weather data'));
        if (result && result[0]) {
            const current = result[0].current;
            console.log(chalk.cyan(`📍 ${result[0].location.name} | 🌡 ${current.temperature}°C | ☁ ${current.skytext} | 💧 ${current.humidity}%`));
        }
    });
}

// Enhanced account loading with validation
function loadAccounts() {
    const accountsFile = path.join(__dirname, 'accounts.json');
    if (!fs.existsSync(accountsFile)) {
        console.error(chalk.red(`${accountsFile} not found. Please create it with account credentials.`));
        return [];
    }

    try {
        const accountsData = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
        const validAccounts = [];
        const invalidAccounts = [];

        accountsData.forEach(account => {
            if (account.username && account.password) {
                if (/^[a-zA-Z0-9._]+$/.test(account.username)) {
                    validAccounts.push({
                        username: account.username.trim(),
                        password: account.password.trim()
                    });
                } else {
                    invalidAccounts.push(`Invalid username format: ${account.username}`);
                }
            } else {
                invalidAccounts.push(`Missing credentials: ${JSON.stringify(account)}`);
            }
        });

        if (invalidAccounts.length > 0) {
            console.warn(chalk.yellow(`Found ${invalidAccounts.length} invalid accounts:`));
            invalidAccounts.forEach(msg => console.warn(chalk.yellow(`- ${msg}`)));
        }

        console.log(chalk.green(`✅ Loaded ${validAccounts.length} valid accounts from ${accountsFile}`));
        return validAccounts;
    } catch (e) {
        console.error(chalk.red(`❌ Error reading ${accountsFile}: ${e.message}`));
        return [];
    }
}

// Enhanced Instagram Reporter with faster execution
class TurboInstagramReporter {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.userAgent = new (require('user-agents'))();
        this.baseUrl = "https://www.instagram.com";
        this.reportReasons = [
            "spam", "inappropriate", "harassment", "impersonation",
            "scam", "hate_speech", "violence", "nudity"
        ];
        this.session = axios.create({
            timeout: 10000, // 10 seconds timeout
            maxRedirects: 0,
            validateStatus: (status) => status < 500
        });
        
        this.session.defaults.headers = {
            'User-Agent': this.userAgent.toString(),
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': `${this.baseUrl}/`,
            'Origin': this.baseUrl,
            'DNT': '1'
        };
    }

    async login(retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                // Initial request to get CSRF token
                const initResponse = await this.session.get(`${this.baseUrl}/accounts/login/`);
                const csrfToken = initResponse.headers['set-cookie']
                    ?.find(c => c.includes('csrftoken'))
                    ?.split(';')[0]
                    ?.split('=')[1];

                if (!csrfToken) {
                    throw new Error('No CSRF token received');
                }

                // Prepare login payload
                const loginTime = Math.floor(Date.now() / 1000);
                const encPassword = `#PWD_INSTAGRAM_BROWSER:0:${loginTime}:${this.password}`;
                
                const payload = new URLSearchParams();
                payload.append('username', this.username);
                payload.append('enc_password', encPassword);
                payload.append('queryParams', '{}');
                payload.append('optIntoOneTap', 'false');

                const headers = {
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-IG-App-ID': '936619743392459',
                    'X-Instagram-AJAX': '1',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Referer': `${this.baseUrl}/accounts/login/`
                };

                // Perform login
                const loginResponse = await this.session.post(
                    `${this.baseUrl}/accounts/login/ajax/`,
                    payload,
                    { headers }
                );

                if (loginResponse.status === 200 && loginResponse.data.authenticated) {
                    console.log(chalk.green(`🔓 Login successful: ${this.username}`));
                    return true;
                } else {
                    const errorMsg = loginResponse.data.message || 'Unknown error';
                    throw new Error(`Login failed: ${errorMsg}`);
                }
            } catch (error) {
                console.warn(chalk.yellow(`⚠️ Login attempt ${attempt + 1} failed for ${this.username}: ${error.message}`));
                if (attempt < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
                }
            }
        }
        console.error(chalk.red(`❌ Login failed for ${this.username} after ${retries} attempts`));
        return false;
    }

    async turboReport(targetUsername, reason = null) {
        const startTime = Date.now();
        const reportId = uuidv4().substr(0, 8);
        const selectedReason = reason || this.reportReasons[Math.floor(Math.random() * this.reportReasons.length)];

        try {
            // Step 1: Get target user's profile
            const profileUrl = `${this.baseUrl}/${targetUsername}/`;
            const profileResponse = await this.session.get(profileUrl, {
                headers: {
                    'Referer': `${this.baseUrl}/`,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (profileResponse.status !== 200) {
                throw new Error(`Profile fetch failed with status ${profileResponse.status}`);
            }

            // Extract user ID
            const userIdMatch = profileResponse.data.match(/"id":"(\d+)"/);
            if (!userIdMatch) {
                throw new Error('Could not extract user ID');
            }
            const userId = userIdMatch[1];

            // Step 2: Prepare report payload
            const reportUrl = `${this.baseUrl}/users/${userId}/report/`;
            const payload = new URLSearchParams();
            payload.append('source_name', '');
            payload.append('reason', selectedReason);
            payload.append('frx_prompt_request_type', '1');

            const headers = {
                'X-CSRFToken': this.session.defaults.headers.common['X-CSRFToken'] || 
                               this.session.defaults.headers['X-CSRFToken'],
                'X-Requested-With': 'XMLHttpRequest',
                'X-IG-App-ID': '936619743392459',
                'Referer': profileUrl,
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            // Step 3: Submit report
            const reportResponse = await this.session.post(reportUrl, payload, { headers });

            if (reportResponse.status === 200) {
                const elapsed = (Date.now() - startTime) / 1000;
                console.log(chalk.green(`✅ [${reportId}] Report success for ${targetUsername} (${selectedReason}) in ${elapsed.toFixed(2)}s`));
                return true;
            } else {
                throw new Error(`Report failed with status ${reportResponse.status}`);
            }
        } catch (error) {
            console.error(chalk.red(`❌ [${reportId}] Report failed for ${targetUsername}: ${error.message}`));
            return false;
        }
    }
}

// Enhanced reporting function with concurrency control
async function turboMassReport(targetUsername, accounts, reportsPerAccount = 1, maxConcurrency = 15) {
    if (!accounts.length) {
        throw new Error('No valid accounts provided');
    }

    const totalReports = accounts.length * reportsPerAccount;
    console.log(chalk.blue(`🚀 Starting TURBO mode: ${totalReports} reports with ${maxConcurrency} concurrent workers`));
    console.log(chalk.blue(`⏱  Started at: ${moment().format('h:mm:ss a')}`));

    const progressBar = new progress.SingleBar({
        format: 'PROGRESS |' + chalk.cyan('{bar}') + '| {percentage}% | {value}/{total} Reports',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true
    });
    progressBar.start(totalReports, 0);

    const reportQueue = [];
    accounts.forEach(account => {
        for (let i = 0; i < reportsPerAccount; i++) {
            reportQueue.push(account);
        }
    });

    // Shuffle the queue for better distribution
    for (let i = reportQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reportQueue[i], reportQueue[j]] = [reportQueue[j], reportQueue[i]];
    }

    let completed = 0;
    let successful = 0;
    let failed = 0;

    const worker = async (account) => {
        const reporter = new TurboInstagramReporter(account.username, account.password);
        try {
            const result = await reporter.turboReport(targetUsername);
            if (result) successful++;
            else failed++;
        } catch (error) {
            failed++;
            console.error(chalk.red(`Worker error: ${error.message}`));
        } finally {
            completed++;
            progressBar.update(completed);
        }
    };

    // Run workers with controlled concurrency
    const concurrency = Math.min(maxConcurrency, reportQueue.length);
    const workers = Array(concurrency).fill().map(async (_, i) => {
        while (reportQueue.length > 0) {
            const account = reportQueue.pop();
            if (account) {
                await worker(account);
                // Random delay between 0.1s and 0.5s to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
            }
        }
    });

    await Promise.all(workers);
    progressBar.stop();

    console.log(chalk.green(`\n🎉 Reporting completed at ${moment().format('h:mm:ss a')}`));
    console.log(chalk.green(`✅ Successful: ${successful}`));
    console.log(chalk.yellow(`⚠️ Failed: ${failed}`));
    console.log(chalk.blue(`⚡ Success rate: ${((successful / totalReports) * 100).toFixed(2)}%`));
}

// Enhanced terminal interface
async function runTurboTerminal() {
    console.clear();
    displayAsciiArt();

    // Open WhatsApp channel in background
    try {
        await open("https://saweria.co/HOZOO", {wait: false});
    } catch (e) {
        console.warn(chalk.yellow(" please donate me 😔🙏🙏 https://saweria.co/HOZOO :"));
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    while (true) {
        console.log(chalk.yellow('\n=== TURBO INSTAGRAM REPORTER ==='));
        
        // Load accounts with validation
        let accounts = [];
        while (accounts.length === 0) {
            accounts = loadAccounts();
            if (accounts.length === 0) {
                console.log(chalk.red('\nNo valid accounts found. Please check accounts.json'));
                await new Promise(resolve => rl.question('Press Enter to reload accounts...', resolve));
                console.clear();
                displayAsciiArt();
            }
        }

        // Get target username
        let targetUsername = '';
        while (!targetUsername) {
            targetUsername = await new Promise(resolve => 
                rl.question(chalk.blue('\nEnter target username: '), resolve)
            ).then(s => s.trim());

            if (!targetUsername) {
                console.warn(chalk.yellow('Username cannot be empty'));
            } else if (!/^[a-zA-Z0-9._]+$/.test(targetUsername)) {
                console.warn(chalk.yellow('Invalid username format'));
                targetUsername = '';
            }
        }

        // Get number of reports
        let reportsPerAccount = 1;
        while (true) {
            const input = await new Promise(resolve => 
                rl.question(chalk.blue('Reports per account (1-10): '), resolve)
            ).then(s => s.trim());

            const num = parseInt(input);
            if (!isNaN(num) && num >= 1 && num <= 10) {
                reportsPerAccount = num;
                break;
            }
            console.warn(chalk.yellow('Please enter a number between 1 and 10'));
        }

        // Get concurrency level
        let concurrency = Math.min(15, accounts.length);
        while (true) {
            const input = await new Promise(resolve => 
                rl.question(chalk.blue(`Concurrent workers (1-${accounts.length}): `), resolve)
            ).then(s => s.trim());

            const num = parseInt(input);
            if (!isNaN(num) && num >= 1 && num <= accounts.length) {
                concurrency = num;
                break;
            }
            console.warn(chalk.yellow(`Please enter a number between 1 and ${accounts.length}`));
        }

        console.log(chalk.magenta(`\n🚀 Starting ${accounts.length * reportsPerAccount} reports on @${targetUsername}`));
        console.log(chalk.magenta(`⚡ Using ${concurrency} concurrent workers`));
        
        try {
            await turboMassReport(targetUsername, accounts, reportsPerAccount, concurrency);
        } catch (error) {
            console.error(chalk.red(`\n❌ Error during reporting: ${error.message}`));
        }

        const choice = await new Promise(resolve => 
            rl.question(chalk.blue('\nRun again? (y/n): '), resolve)
        ).then(s => s.trim().toLowerCase());

        if (choice !== 'y' && choice !== 'yes') {
            break;
        }

        console.clear();
        displayAsciiArt();
    }

    rl.close();
    console.log(chalk.green('\nThank you for using Turbo Instagram Reporter!'));
}

// Main execution
(async () => {
    try {
        // Check for required modules
        const requiredModules = ['axios', 'uuid', 'user-agents', 'moment', 'weather-js', 'cli-progress'];
        for (const module of requiredModules) {
            try {
                require.resolve(module);
            } catch {
                console.error(chalk.red(`Error: Required module '${module}' is not installed.`));
                console.log(chalk.blue('Run: npm install axios uuid user-agents moment weather-js cli-progress'));
                process.exit(1);
            }
        }

        await runTurboTerminal();
    } catch (error) {
        console.error(chalk.red(`\n💥 Critical error: ${error.message}`));
        process.exit(1);
    }
})();
