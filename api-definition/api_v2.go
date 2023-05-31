package main

import "time"

// Requests
//Same as v1

type API_V2 interface {
	GetVersion_V2() Infos_V2
	GetPaste_V2(id string) Paste_V2
	PostPaste_V2(paste PasteToStore_V2)
}

type Paste_V2 struct {
	Id string `json:"id"`

	Content []byte `json:"content"`

	EncParams EncryptionParams `json:"enc_params"` // Can be null

	NbViews uint `json:"nb_views"`

	// Expirations
	ExpirationTime   time.Time `json:"expiration_time"`
	ExpirationNbView uint      `json:"expiration_nb_views"`

	// Related to CAP_IPFS Capability
	IsIPFS bool `json:"is_ipfs"`

	// Related to CAP_BITCON_HEIGHT Capability
	ExpirationBitcoinHeight uint `json:"expiration_bitcon_height"`

	CreatedAt time.Time `json:"created_at"` // Truncated to day (no hours, days, minutes stored)
}

type PasteToStore_V2 struct {
	Content []byte `json:"content"`

	EncParams EncryptionParams `json:"enc_params"`

	// Expirations
	ExpirationTime   time.Time `json:"expiration_time"`
	ExpirationNbView uint      `json:"expiration_nb_views"`

	// Related to IPFS Capability
	IsIPFS bool `json:"is_ipfs"`

	// Related to CAP_BITCON_HEIGHT Capability
	ExpirationBitcoinHeight uint `json:"expiration_bitcon_height"`
}

const (
	CAP_IPFS          = "IPFS"
	CAP_BITCON_HEIGHT = "BITCON_HEIGHT"
)

var CAPABILITIES = []string{CAP_IPFS, CAP_BITCON_HEIGHT}

type Infos_V2 struct {
	APIVersion     string `json:"api_version"` // Fixed to v2
	BackendVersion string `json:"backend_version"`

	Capabilities []string // With values amongst CAP_* above
}

type EncryptionParams struct {
	Iv     string `json:"iv"`
	V      uint   `json:"v"`
	Iter   uint   `json:"iter"`
	Ks     uint   `json:"ks"`
	Ts     uint   `json:"ts"`
	Mode   string `json:"mode"`
	Adata  string `json:"adata"`
	Cipher string `json:"cipher"`
	Salt   string `json:"salt"`
}
