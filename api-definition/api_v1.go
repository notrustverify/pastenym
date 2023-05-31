package main

import "time"

// Requests
const (
	NewPasteEvent = "newPaste"
	GetPasteEvent = "getPaste"
	VersionEvent  = "version"
)

type API_V1 interface {
	GetVersion_V1() Infos_V1
	GetPaste_V1(id string) Paste_V1
	NewPaste_V1(paste PasteToStore_V1)
}

type Request struct {
	Event string `json:"event"`

	Data interface{} `json:"data"`
}

// Request for NewPasteEvent
// {"type":"sendAnonymous","recipient":"...","replySurbs":2,"message":"{'event':'newPaste','data':{'content':'myText'}"}
// {"type":"reply","recipient":"...","message":"'data':{'id':'myId'}"}
type NewPasteRequest struct {
	Request

	Data Paste_V1 `json:"data"`
}

// Request for GetPasteEvent
// {"type":"sendAnonymous","recipient":"...","replySurbs":2,"message":"{'event':'getPaste','data':{'id':'myId'}"}
// {"type":"reply","recipient":"...","message":"{'data':{'id':'myId','content':'myText','created_at':'2023-05-31:00-00-00'}"}
type GetPasteRequest struct {
	Request

	Data string `json:"data"`
}

type PasteToStore_V1 struct {
	Content string `json:"content"`
}

type Paste_V1 struct {
	Id        string    `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"` // Truncated to day (no hours, days, minutes stored)
}

type Infos_V1 struct {
	APIVersion     string `json:"api_version"` // Fixed to v1
	BackendVersion string `json:"backend_version"`
}
