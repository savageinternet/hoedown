# SXSW Kinoma

A repository of greater awesomeness for Kinoma development in the days
leading up to SXSW.

## Caveats

The main caveat: this is mainly on github as a public record of our work.  It
is unlikely to be maintained or supported in any way, although we might
respond to a direct question, comment, or pull request.  Caveat lector.

- You will need a Kinoma Create, some sensors, and a bunch of wire to make the
  Kinoma projects useful.  Parts lists, wiring diagrams, and detailed
  instructions don't exist; we might put these up at some point, but only if
  we find a chunk of time to do so.
- This code is best thought of as mostly unpolished hackathon code.  There's a
  lot of cruft, and what you see is likely not the best way to do things.
- We've stripped our AWS keys, admin passwords, and any other secret tidbits
  that we could find.  If for some reason you want to try and run pieces of
  this code, you will need to supply actual values.  Note that not all of these
  values are in `settings.py` or any other single configuration file.
- The hostname, AWS links for CSS/JS files, etc. are all hardcoded; if you want
  to host this elsewhere or make changes to the static assets, you will need to
  change those.
