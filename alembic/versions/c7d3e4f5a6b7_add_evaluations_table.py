"""add_evaluations_table

Revision ID: c7d3e4f5a6b7
Revises: b6c940de6ee9
Create Date: 2025-10-30 14:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c7d3e4f5a6b7'
down_revision: Union[str, Sequence[str], None] = 'b6c940de6ee9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'evaluations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('session_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        
        sa.Column('criterion1_score', sa.Integer(), nullable=False),
        sa.Column('criterion1_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion2_score', sa.Integer(), nullable=False),
        sa.Column('criterion2_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion3_score', sa.Integer(), nullable=False),
        sa.Column('criterion3_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion4_score', sa.Integer(), nullable=False),
        sa.Column('criterion4_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion5_score', sa.Integer(), nullable=False),
        sa.Column('criterion5_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion6_score', sa.Integer(), nullable=False),
        sa.Column('criterion6_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion7_score', sa.Integer(), nullable=False),
        sa.Column('criterion7_explanation', sa.Text(), nullable=False),
        
        sa.Column('criterion8_score', sa.Integer(), nullable=False),
        sa.Column('criterion8_explanation', sa.Text(), nullable=False),
        
        sa.Column('improvement_suggestions', sa.JSON(), nullable=False),
        
        sa.ForeignKeyConstraint(['session_id'], ['sessions.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('evaluations')

