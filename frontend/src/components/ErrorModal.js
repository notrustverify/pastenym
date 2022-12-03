import * as React from 'react'
import Typography from '@mui/joy/Typography';
import Modal from '@mui/joy/Modal'
import ModalClose from '@mui/joy/ModalClose'
import Sheet from '@mui/joy/Sheet'

class ErrorModal extends React.Component {
    constructor(props) {
        super(props)

    }

    render() {
        return (
                <Modal
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                    open={this.props.open}
                    onClose={() => this.props.handler(false)}
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Sheet
                        variant="outlined"
                        sx={{
                            maxWidth: 500,
                            borderRadius: 'md',
                            p: 3,
                            boxShadow: 'lg',
                        }}
                    >
                        <ModalClose
                            variant="outlined"
                            sx={{
                                top: 'calc(-1/4 * var(--IconButton-size))',
                                right: 'calc(-1/4 * var(--IconButton-size))',
                                boxShadow: '0 2px 12px 0 rgba(0 0 0 / 0.2)',
                                borderRadius: '50%',
                                bgcolor: 'background.body',
                            }}
                        />
                        <Typography
                            component="h2"
                            id="modal-title"
                            level="h4"
                            textColor="inherit"
                            fontWeight="lg"
                            mb={1}
                        >
                            Error
                        </Typography>
                        <Typography id="modal-desc" textColor="text.tertiary">
                            {this.props.textError}
                        </Typography>
                    </Sheet>
                </Modal>
      )
    }
        
    
}


export default ErrorModal