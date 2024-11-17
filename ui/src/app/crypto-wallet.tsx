'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, Settings, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription,DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createWalletClient, createPublicClient, http, formatEther, parseEther, getAddress, encodeFunctionData, toHex, hexToBytes, encodeAbiParameters, parseAbiParameters, keccak256 } from 'viem'
import { signAuthorization } from 'viem/experimental'
import { mnemonicToAccount } from 'viem/accounts'
import { mekong } from 'viem/chains'

export default function CryptoWallet() {
  const DEFAULT_MNEMONIC = ""
  const CONTRACT_7702 = "0x0Ad3da17498CA898902E106A04CB08D9c27C09ED" // dummy
  const CONTRACT_7702_2 = "0xABf8a3c539792317590E0E2a1656a7B935FBd156"

  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [sendDialogOpen, setSendDialogOpen] = useState(false)
  const [migrateDialogOpen, setMigrateDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [sendAmount, setSendAmount] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mnemonicPhrase, setMnemonicPhrase] = useState(DEFAULT_MNEMONIC)
  const [index1, setIndex1] = useState(0)
  const [index2, setIndex2] = useState(1)
  const [signature, setSignature] = useState("")
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCode, setIsCode] = useState(false)
  
  const { toast } = useToast()
  const ethPublicClient = createPublicClient({chain: mekong, transport: http()})

  const account = mnemonicToAccount(mnemonicPhrase, {addressIndex : index1})

  const onSend = async () => {
    if (mnemonicPhrase.length == 0) {
      setSettingsDialogOpen(true)
      return
    }
    setIsSending(true)
    const ethClient = createWalletClient({chain: mekong, transport: http()})
    var hashResult:string = ""
    if (!isCode) {     
      const account = mnemonicToAccount(mnemonicPhrase, {addressIndex : index1})
      try {
        hashResult = await ethClient.sendTransaction({account, to: getAddress(recipientAddress), value: parseEther(sendAmount)})
      }
      catch(e) {
        console.log(e)
      }
    }
    else {
/* dummy sample contract */
/*      
      const account = mnemonicToAccount(mnemonicPhrase, {addressIndex : index2})
      const accountDelegated = mnemonicToAccount(mnemonicPhrase, {addressIndex : index1})
      const transactAbi = {"type":"function","name":"transact","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"data","type":"bytes","internalType":"bytes"},{"name":"value","type":"uint256","internalType":"uint256"},{"name":"r","type":"bytes32","internalType":"bytes32"},{"name":"s","type":"bytes32","internalType":"bytes32"}],"outputs":[],"stateMutability":"nonpayable"}
      const data = encodeFunctionData({
        abi: [transactAbi],
        args: [ getAddress(recipientAddress), "0x", parseEther(sendAmount), "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000" ]
      })
      try {        
        hashResult = await ethClient.sendTransaction({account, to: accountDelegated.address, data: data})
      }
      catch(e) {
        console.log(e)
      }
*/
      const account = mnemonicToAccount(mnemonicPhrase, {addressIndex : index2})
      const accountDelegated = mnemonicToAccount(mnemonicPhrase, {addressIndex : index1})
      const transactAbi = {"type":"function","name":"transact","inputs":[{"name":"to","type":"address","internalType":"address"},{"name":"data","type":"bytes","internalType":"bytes"},{"name":"value","type":"uint256","internalType":"uint256"},{"name":"r","type":"uint256","internalType":"uint256"},{"name":"s","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"}
      const nonceAbi = {"type":"function","name":"nonce","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"}
      const dataNonce = encodeFunctionData({
        abi: [nonceAbi],
        args: []
      })
      const nonce = await ethPublicClient.call({account, to: accountDelegated.address, data:dataNonce})
      console.log("Nonce")
      console.log(nonce)
      const dataToSign = encodeAbiParameters(
        parseAbiParameters("uint256 nonce, address to, bytes memory data, uint256 value"),
        [ nonce.data, getAddress(recipientAddress), "0x", parseEther(sendAmount) ]
      )
      const messageToSign = keccak256(dataToSign)
      console.log("Message to sign " + messageToSign)                  
      // TODO : JS integration - temporarily requires a back&forth with Python
      if (signature.length == 0) {
        toast({
          title: "Hackathon Moment",
          description: "Please sign " + messageToSign,
          variant: "default",
        })
        setIsSending(false)
        setSendDialogOpen(false)
        return
      }
      const sigRS = hexToBytes("0x" + signature)
      const sigR = toHex(sigRS.slice(0, 32))
      const sigS = toHex(sigRS.slice(32))
      const data = encodeFunctionData({
        abi: [transactAbi],
        args: [ getAddress(recipientAddress), "0x", parseEther(sendAmount), sigR, sigS ]
      })
      try {        
        hashResult = await ethClient.sendTransaction({account, to: accountDelegated.address, data: data})
      }
      catch(e) {
        console.log(e)
      }
    }
    if (hashResult.length != 0) {
      console.log("[SEND] " + sendAmount + " to " + recipientAddress + " : " + hashResult)
    }
    setIsSending(false)
    setSendDialogOpen(false)
    setRecipientAddress("")
    setSendAmount("")
    handleRefresh(false)
    
    toast({
      title: hashResult.length != 0 ? "Transaction Sent" : "Transaction Failed",
      description: hashResult.length != 0 ? "TX hash " + hashResult : "",
      variant: hashResult.length != 0 ? "default" : "destructive",
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Address Copied",
        description: "Ethereum address copied to clipboard",
      })
    } catch (err) {
      console.error('Failed to copy: ', err)
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleSettingsSave = () => {
    // Here you would typically handle saving the settings
    // For now, we'll just close the dialog and show a toast
    setSettingsDialogOpen(false)
    handleRefresh()
    toast({
      title: "Settings Saved",
      description: "Your wallet settings have been updated.",
    })
  }

  const handleRefresh = async (giveToast:boolean=true) => {
    if (mnemonicPhrase.length == 0) {
      setSettingsDialogOpen(true)
      return
    }
    setIsRefreshing(true)
    const account1 = mnemonicToAccount(mnemonicPhrase, {addressIndex : index1})
    const balance = await ethPublicClient.getBalance(account1)  
    const bytecode = await ethPublicClient.getCode(account1)
    setIsCode(bytecode != undefined)
    setAddress(account1.address)
    setBalance(formatEther(balance)) 
    setIsRefreshing(false)
    if (giveToast) {
      toast({
        title: "Balance Refreshed",
        description: "Your wallet balance has been updated.",
      })
    }
  }

  const handleMigrate = async () => {
   if (mnemonicPhrase.length == 0) {
      setSettingsDialogOpen(true)
      return
    }
    const ethClient = createWalletClient({chain: mekong, transport: http()})
    var hashResult:string = ""
    const account = mnemonicToAccount(mnemonicPhrase, {addressIndex : index1})
    const initAbi = {"type":"function","name":"authorize","inputs":[{"name":"publicKeyX","type":"uint256","internalType":"uint256"},{"name":"publicKeyY","type":"uint256","internalType":"uint256"}],"outputs":[],"stateMutability":"nonpayable"}
      const data = encodeFunctionData({
        abi: [initAbi],
        // TODO : JS integration - compute the aggregated keys for the current keys
        args: [ "0x6df2a8a7b8c07523f38e445c7e1c13d50e7454e7b0a7d8566803982b319df24e", "0xa4dc01cba28c941290cf13507a9132dd6858428bf41fd13eb972221c670e8604" ]
      })
      try {
        // dummy sample contract
        //const authorization = await signAuthorization(ethClient, {account:account, contractAddress: getAddress(CONTRACT_7702)}) 
        const authorization = await signAuthorization(ethClient, {account:account, contractAddress: getAddress(CONTRACT_7702_2)})
        hashResult = await ethClient.sendTransaction({account, to: account.address, data: data, authorizationList: [authorization]})
      }
      catch(e) {
        console.log(e)
      }
    if (hashResult.length != 0) {
      console.log("[MIGRATION] " + account.address + " TX hash " + hashResult)
    }
    setMigrateDialogOpen(false)
    toast({
      title: hashResult.length != 0 ? "Migration Complete" : "Migration failed",
      description: hashResult.length != 0 ? "Your wallet has been successfully migrated. TX hash " + hashResult : "",
      variant: hashResult.length != 0 ? "default" : "destructive",
    })
  }  

  useEffect(() => {
    handleRefresh();
  }, []);


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Unruggable Wallet</CardTitle>
         {isCode && <Check className="h-5 w-5 text-green-500" />}
        <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Open settings</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Wallet Settings</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mnemonic" className="text-right">
                  Mnemonic Phrase
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="mnemonic"
                    type={isMnemonicVisible ? "text" : "password"}
                    value={mnemonicPhrase}
                    onChange={(e) => setMnemonicPhrase(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setIsMnemonicVisible(!isMnemonicVisible)}
                  >
                    {isMnemonicVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isMnemonicVisible ? "Hide mnemonic" : "Show mnemonic"}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="index1" className="text-right">
                  Index 1
                </Label>
                <Input
                  id="index1"
                  type="number"
                  value={index1}
                  onChange={(e) => setIndex1(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="index2" className="text-right">
                  Index 2
                </Label>
                <Input
                  id="index2"
                  type="number"
                  value={index2}
                  onChange={(e) => setIndex2(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="signature" className="text-right">
                  Signature
                </Label>
                <Input
                  id="signature"
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="col-span-3"
                />
              </div>              
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSettingsSave}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-bold flex items-center gap-2">
          {balance} ETH
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh balance</span>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{address.slice(0, 6)}...{address.slice(-4)}</div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy full address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Show QR</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-base font-normal px-4">{address}</DialogTitle>
                  <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center p-6">
                  <QRCodeSVG value={address} size={256} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
          <DialogTrigger asChild>
            <Button>Send</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Send ETH</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipient" className="text-right">
                  To
                </Label>
                <Input
                  id="recipient"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Ethereum address"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="ETH amount"
                  type="number"
                  min="0"
                  step="0.0001"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
              <Button onClick={onSend} disabled={isSending}>
                {isSending ? "Sending..." : "OK"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
              <Dialog open={migrateDialogOpen} onOpenChange={(open) => { if (!isCode) { setMigrateDialogOpen(open); } }}>
                <DialogTrigger asChild>
                  <Button variant="secondary" disabled={isCode}>
                    {isCode ? "Migrated" : "Migrate"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Migrate</DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                  <div className="p-4 text-center">
                    <p className="mb-4">Are you sure you want to migrate your wallet?</p>
                    <Button onClick={handleMigrate}>Confirm Migration</Button>
                  </div>
                </DialogContent>
              </Dialog>
      </CardFooter>
    </Card>
  )
}

