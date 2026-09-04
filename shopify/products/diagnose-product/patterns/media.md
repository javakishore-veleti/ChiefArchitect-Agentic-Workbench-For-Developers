# Media processing

Trace staged upload, file creation/attachment, asynchronous media status, variant association and ordering as distinct stages. GraphQL media workflows do not reproduce the old REST base64 image operation in one implicit step.

Capture media/file status and errors before attaching or reordering. Verify URL reachability, MIME type, size and target variant ownership. A product update succeeding does not prove processing or variant association succeeded. Retry only transient stages; avoid creating duplicate media.
