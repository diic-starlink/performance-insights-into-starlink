# Running Jupyter on Slurm Cluster

This guides talks about how to run a Jupyter Lab on DE Lab.

## Connect to DE Lab

Open a terminal and run

```bash
ssh Firstname.Lastname@delab.i.hpi.de
salloc -A bajpai
```

## Run Jupyter Container

Then get your hands on a Jupyter Docker container. For example do the following:

```bash
# Downloads and build an .sqsh file.
enroot import docker://jupyter/datascience-notebook
# Give the file a better name.
mv jupyter+datascience-notebook.sqsh jupyter.sqsh
# Create a Jupyter filesystem that we can run
enroot create jupyter.sqsh
# Run the container with read-write priviledges
enroot start --rw jupyter
```

This will run a Jupyter container. However, it is not yet available on your machine as
the server is not accessible directly. To do this, run an SSH tunnel to the cluster
(open a second terminal for that). Connecting to the allocated node will only be possible
if you already allocated that node previously. Otherwise, the cluster will not allow you
to connect.

```bash
ssh Firstname.Lastname@yournode.delab.i.hpi.de -N -L 8888:localhost:8888
```

`yournode` in this case is the node that has been allocated for you with the `salloc`
command right after connection to the cluster (e.g., `tx01` or `tx02`).

Now, Jupyter should be available on http://localhost:8888 to you.
