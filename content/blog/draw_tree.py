"""Tree layout & rendering for nested lists and Trees.

Assumes that Tree objects have the following attributes:

class Tree:
    def __init__(self, tag, branches):
        assert len(branches) >= 1
        for b in branches:
            assert isinstance(b, Tree) or isinstance(b, Leaf)
        self.tag = tag
        self.branches = branches

class Leaf:
    def __init__(self, tag, word):
        self.tag = tag
        self.word = word
"""

import networkx as nx

class Node:
    """A labeled node."""
    def __init__(self, label):
        self.label = label
    def __str__(self):
        return self.label

def node_tree(t):
    """A tree represented as a Node and branches containing Nodes."""
    tag, branches = tag_branches(t)
    return Node(tag), [node_tree(b) for b in branches]

def tag_branches(t):
    """Split a tree t (of varying type) into a tag and branches."""
    if hasattr(t, 'word'):
        return t.tag, [t.word]
    elif hasattr(t, 'branches'):
        return t.tag, t.branches
    elif isinstance(t, str):
        return t, []
    else:
        return t

def render(tag, branches, left, top, tree):
    """Render t by adding a Node to tree starting at position (left, top)."""
    # Render child branches to determine the position of the parent.
    right = left
    for child, child_branches in branches:
        right = render(child, child_branches, right, top-1, tree)+1
    right = max(left, right-1) # Decrement right if it was ever incremented

    # Add tag and attach it to its children.
    tree.add_node(tag, pos=((left+right)/2, top), interior=len(branches)>0)
    for b in branches:
        tree.add_edge(tag, b[0])
    return right

def draw_tree(t, ax=None):
    """Draw a phrase-structure tree (of varying type)."""
    tree = nx.DiGraph()
    tag, branches = node_tree(t)
    render(tag, branches, 0, 0, tree)

    # In order to differentiate interior and leaf nodes, we draw twice.
    nodes = nx.get_node_attributes(tree, 'interior').items()
    interiors={node: (node if interior else "") for node, interior in nodes}
    leaves={node: (node if not interior else "") for node, interior in nodes}

    def draw_labels(labels, **kwargs):
        """Draw a tree with the specified labels and drawing keyword args."""
        nx.draw(tree, nx.get_node_attributes(tree, 'pos'),
                labels=labels, node_shape=None, edge_color='gray',
                style='dotted', arrows=False, font_size=12, ax=ax,
                with_labels=True, **kwargs)

    draw_labels(interiors, font_weight='bold')
    draw_labels(leaves, font_color='blue')
