# Daily Spark Solana [Frontend Live url](https://dailysparksolana.vercel.app/)

Program ID : [FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv](https://solscan.io/account/FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv?cluster=devnet)

Authority ID : 13DQ49SPqoxZRxDEXcGPnXjBprXmRnJoXbMXk6KgMRHz

# Daily Spark Solana Frontend Features

1. **Connect Wallet** - Connect your Solana wallet (Phantom, Solflare, etc.)
2. **Initialize Journal** - Click "Initialize Journal" to set up your personal idea journal PDA
3. **Generate Prompts** - Use "Generate Idea Prompt" for creative inspiration
4. **Log Ideas** - Click "Log New Idea" to record your daily idea and maintain your streak
5. **Track Progress** - View your current streak and see when you last logged an idea
6. **Refresh Data** - Use "Refresh Streak" to update your current streak information
7. **Account Page** - Manage Solana Wallet, See Tokens, Transactions Log, Send Recieve Transactions

8. **Dark Mode** - Toggle dark mode for better visibility
9. **Responsive Design** - Works on desktop and mobile devices

# One Another Project I'm Working On :

# Smart City OS :  My College Project which uses School Of Solana Learnings to apply  Immutable Transparent Civil Important Data Recording Microservice

Program ID : A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An 
https://smartcityos.vercel.app/blockchain


# Testing the Frontend : 


#### Install Dependencies

```shell
npm install
```
#### Run the Frontend
```shell
npm run dev
```

Hope you like the Frontend, though credit goes to School Of Solana for the learnings and Solana Foundation Web3 Dapp Template for the Template.



# Generate By Solana Dapp Template


This is a Next.js app containing:

- Tailwind CSS setup for styling
- Useful wallet UI elements setup using [@solana/web3.js](https://www.npmjs.com/package/@solana/web3.js)
- A basic Greeter Solana program written in Anchor
- UI components for interacting with the Greeter program

## Getting Started

### Installation

#### Download the template

```shell
pnpm create solana-dapp@latest -t gh:solana-foundation/templates/web3js/frontend
```

#### Install Dependencies

```shell
pnpm install
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the
command with `pnpm`, eg: `pnpm anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the
Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/counter-exports.ts` to match the new program id.

```shell
pnpm anchor keys sync
```

#### Build the program:

```shell
pnpm anchor-build
```

#### Start the test validator with the program deployed:

```shell
pnpm anchor-localnet
```

#### Run the tests

```shell
pnpm anchor-test
```

#### Deploy to Devnet

```shell
pnpm anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
pnpm dev
```

Build the web app

```shell
pnpm build
```
